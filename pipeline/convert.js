#!/usr/bin/env node
/**
 * WizardingFrame — Content Pipeline
 * Converts Apple Live Photos and various video formats into
 * seamlessly looping WebM/MP4 files optimized for the frame.
 *
 * Requirements: ffmpeg must be installed
 *   macOS:  brew install ffmpeg
 *   Linux:  sudo apt install ffmpeg
 *   Pi:     sudo apt install ffmpeg
 *
 * Usage:
 *   node pipeline/convert.js --input ./my-photos --output ./media
 *   node pipeline/convert.js --input photo.HEIC --output ./media
 */

const { execSync, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// ─── Config ───────────────────────────────────────────────────────────────────

const CONFIG = {
  // Output resolution — WxH display string; resFilter is the ffmpeg filter-safe version
  resolution: '1920x1080',
  get resFilter() { return this.resolution.replace('x', ':'); },

  // Output format: 'mp4' or 'webm' (webm = smaller, better for web)
  format: 'mp4',

  // Loop style for videos: 'bounce' (forward+reverse) or 'loop' (just repeat)
  loopStyle: 'bounce',

  // Quality (0=best, 51=worst for h264; 0-63 for VP9)
  quality: 23,

  // Smooth slow-mo: stretch short clips to this duration (seconds). 0 = don't stretch
  targetDuration: 8,
};

// Supported input formats
const IMAGE_EXTS  = ['.jpg', '.jpeg', '.png', '.heic', '.heif', '.webp', '.avif'];
const VIDEO_EXTS  = ['.mov', '.mp4', '.m4v', '.avi', '.mkv'];
const LIVEPHOTO_EXTS = ['.mov']; // Live Photos export as .mov paired with .jpg

// ─── Helpers ──────────────────────────────────────────────────────────────────

function checkFFmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch {
    console.error('❌ ffmpeg not found. Install it first:');
    console.error('   macOS:  brew install ffmpeg');
    console.error('   Linux:  sudo apt install ffmpeg');
    process.exit(1);
  }
}

function getFiles(inputPath) {
  const stat = fs.statSync(inputPath);
  if (stat.isFile()) return [inputPath];

  return fs.readdirSync(inputPath)
    .map(f => path.join(inputPath, f))
    .filter(f => {
      const ext = path.extname(f).toLowerCase();
      return IMAGE_EXTS.includes(ext) || VIDEO_EXTS.includes(ext);
    });
}

function detectLivePhotoGroup(files) {
  // Live Photos: a .jpg and a .mov with the same base filename
  const byBase = {};
  files.forEach(f => {
    const base = path.join(path.dirname(f), path.basename(f, path.extname(f)));
    if (!byBase[base]) byBase[base] = {};
    const ext = path.extname(f).toLowerCase();
    if (IMAGE_EXTS.includes(ext)) byBase[base].image = f;
    if (VIDEO_EXTS.includes(ext)) byBase[base].video = f;
  });

  const livePhotos = [];
  const standalone = [];

  Object.values(byBase).forEach(group => {
    if (group.image && group.video) {
      livePhotos.push(group);
    } else {
      if (group.image) standalone.push(group.image);
      if (group.video) standalone.push(group.video);
    }
  });

  return { livePhotos, standalone };
}

// ─── Converters ───────────────────────────────────────────────────────────────

/**
 * Convert a Live Photo (video component) into a seamlessly looping video.
 * The "bounce" technique plays forward then reverse — very smooth magical effect.
 */
function convertLivePhoto(videoPath, outputDir, imagePath = null) {
  const base = path.basename(videoPath, path.extname(videoPath));
  const outputPath = path.join(outputDir, `${base}_loop.mp4`);

  console.log(`🪄  Converting Live Photo: ${path.basename(videoPath)}`);

  let ffmpegCmd;

  if (CONFIG.loopStyle === 'bounce') {
    // Forward + reverse = seamless bounce loop
    // Slow to targetDuration, apply gentle smoothing
    ffmpegCmd = `ffmpeg -y -i "${videoPath}" \
      -filter_complex "[0:v]setpts=${CONFIG.targetDuration / 3}*PTS,scale=${CONFIG.resFilter}:flags=lanczos,split[fwd1][fwd2]; \
                       [fwd2]reverse[rev]; \
                       [fwd1][rev]concat=n=2:v=1:a=0[out]" \
      -map "[out]" \
      -c:v libx264 -crf ${CONFIG.quality} -preset slow \
      -profile:v high -pix_fmt yuv420p \
      -movflags +faststart \
      "${outputPath}"`;
  } else {
    // Simple loop
    ffmpegCmd = `ffmpeg -y -i "${videoPath}" \
      -vf "scale=${CONFIG.resFilter}:flags=lanczos,setpts=${CONFIG.targetDuration / 3}*PTS" \
      -c:v libx264 -crf ${CONFIG.quality} -preset slow \
      -profile:v high -pix_fmt yuv420p \
      -movflags +faststart \
      "${outputPath}"`;
  }

  try {
    execSync(ffmpegCmd, { stdio: 'inherit' });
    console.log(`✅ Done: ${outputPath}`);
    // Remove originals so only the loop video plays in the frame
    fs.unlinkSync(videoPath);
    if (imagePath && fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    return outputPath;
  } catch (err) {
    console.error(`❌ Failed: ${videoPath}`, err.message);
    return null;
  }
}

/**
 * Optimize a regular video for the frame (resize, re-encode)
 */
function optimizeVideo(videoPath, outputDir) {
  const base = path.basename(videoPath, path.extname(videoPath));
  const outputPath = path.join(outputDir, `${base}.mp4`);

  if (videoPath === outputPath) return; // Already in place

  console.log(`🎬  Optimizing video: ${path.basename(videoPath)}`);

  const cmd = `ffmpeg -y -i "${videoPath}" \
    -vf "scale=${CONFIG.resFilter}:flags=lanczos" \
    -c:v libx264 -crf ${CONFIG.quality} -preset slow \
    -profile:v high -pix_fmt yuv420p \
    -an -movflags +faststart \
    "${outputPath}"`;

  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`✅ Done: ${outputPath}`);
  } catch (err) {
    console.error(`❌ Failed: ${videoPath}`, err.message);
  }
}

/**
 * Convert a still image to an optimized JPEG/WebP
 */
function optimizeImage(imagePath, outputDir) {
  const base = path.basename(imagePath, path.extname(imagePath));
  const outputPath = path.join(outputDir, `${base}.jpg`);

  console.log(`🖼️   Optimizing image: ${path.basename(imagePath)}`);

  const cmd = `ffmpeg -y -i "${imagePath}" \
    -vf "scale=${CONFIG.resFilter}:flags=lanczos:force_original_aspect_ratio=decrease,pad=${CONFIG.resFilter}:(ow-iw)/2:(oh-ih)/2:black" \
    -q:v 2 \
    "${outputPath}"`;

  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`✅ Done: ${outputPath}`);
  } catch (err) {
    console.error(`❌ Failed: ${imagePath}`, err.message);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const inputIdx = args.indexOf('--input');
  const outputIdx = args.indexOf('--output');

  const inputPath  = inputIdx >= 0 ? args[inputIdx + 1] : './media';
  const outputPath = outputIdx >= 0 ? args[outputIdx + 1] : './media';

  checkFFmpeg();

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Input path not found: ${inputPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  console.log(`\n🪄 WizardingFrame Pipeline`);
  console.log(`   Input:  ${path.resolve(inputPath)}`);
  console.log(`   Output: ${path.resolve(outputPath)}\n`);

  const files = getFiles(inputPath);
  const { livePhotos, standalone } = detectLivePhotoGroup(files);

  console.log(`Found: ${livePhotos.length} Live Photos, ${standalone.length} standalone files\n`);

  // Process Live Photos
  livePhotos.forEach(({ video, image }) => convertLivePhoto(video, outputPath, image));

  // Process standalone files
  standalone.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    if (VIDEO_EXTS.includes(ext)) {
      optimizeVideo(file, outputPath);
    } else if (IMAGE_EXTS.includes(ext)) {
      optimizeImage(file, outputPath);
    }
  });

  console.log(`\n✨ Pipeline complete! Drop the files in ${outputPath} into your WizardingFrame.\n`);
}

main();
