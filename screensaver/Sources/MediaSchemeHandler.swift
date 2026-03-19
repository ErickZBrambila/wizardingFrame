import WebKit
import Foundation

final class MediaSchemeHandler: NSObject, WKURLSchemeHandler {

    var mediaFolderURL: URL?

    private static let imageExts = Set(["jpg", "jpeg", "png", "gif", "webp", "heic", "avif"])
    private static let videoExts = Set(["mp4", "mov", "m4v"])
    private static let mediaExts = imageExts.union(videoExts)

    // MARK: - WKURLSchemeHandler

    func webView(_ webView: WKWebView, start task: any WKURLSchemeTask) {
        guard let url = task.request.url else {
            fail(task, 400); return
        }
        let path = url.path

        if path.hasPrefix("/api/") {
            handleAPI(path: path, task: task)
        } else if path.hasPrefix("/media/") {
            serveMedia(path: path, task: task)
        } else {
            serveAsset(path: path, task: task)
        }
    }

    func webView(_ webView: WKWebView, stop task: any WKURLSchemeTask) {}

    // MARK: - API

    private func handleAPI(path: String, task: any WKURLSchemeTask) {
        if path == "/api/config" {
            let config: [String: Any] = [
                "mode": "wizarding",
                "slideDuration": 12000,
                "transitionDuration": 2000,
                "effects": [
                    "grain": true,
                    "vignette": true,
                    "colorGrade": true,
                    "frameOverlay": false,
                    "scanlines": false
                ],
                "grainIntensity": 0.04,
                "vignetteIntensity": 0.6,
                "shuffle": true
            ]
            respondJSON(config, to: task)
        } else if path == "/api/media" {
            respondJSON(["files": scanMedia()], to: task)
        } else {
            fail(task, 404)
        }
    }

    // MARK: - Media

    private func scanMedia() -> [[String: String]] {
        guard let folder = mediaFolderURL else { return [] }
        let fm = FileManager.default
        guard let items = try? fm.contentsOfDirectory(
            at: folder,
            includingPropertiesForKeys: [.isRegularFileKey],
            options: [.skipsHiddenFiles]
        ) else { return [] }

        return items
            .filter { Self.mediaExts.contains($0.pathExtension.lowercased()) }
            .compactMap { url in
                let ext = url.pathExtension.lowercased()
                guard let encoded = url.lastPathComponent
                    .addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) else { return nil }
                return [
                    "url": "wizarding://player/media/\(encoded)",
                    "type": Self.videoExts.contains(ext) ? "video" : "image",
                    "name": url.lastPathComponent
                ]
            }
    }

    private func serveMedia(path: String, task: any WKURLSchemeTask) {
        guard let folder = mediaFolderURL else { fail(task, 404); return }
        let filename = String(path.dropFirst("/media/".count))
        guard !filename.isEmpty, !filename.contains("..") else { fail(task, 403); return }

        let fileURL = folder.appendingPathComponent(filename)
        guard let data = try? Data(contentsOf: fileURL) else { fail(task, 404); return }
        respond(data: data, mimeType: mimeType(fileURL.pathExtension), url: task.request.url!, task: task)
    }

    // MARK: - Bundled Assets

    private func serveAsset(path: String, task: any WKURLSchemeTask) {
        let bundle = Bundle(for: type(of: self))
        guard let resourcesURL = bundle.resourceURL else { fail(task, 500); return }

        // Strip leading slash; assets live in Resources/player/
        let relativePath = String(path.dropFirst())
        let fileURL = resourcesURL.appendingPathComponent("player").appendingPathComponent(relativePath)

        guard FileManager.default.fileExists(atPath: fileURL.path),
              let data = try? Data(contentsOf: fileURL) else {
            fail(task, 404); return
        }
        respond(data: data, mimeType: mimeType(fileURL.pathExtension), url: task.request.url!, task: task)
    }

    // MARK: - Helpers

    private func respondJSON(_ object: Any, to task: any WKURLSchemeTask) {
        guard let data = try? JSONSerialization.data(withJSONObject: object) else {
            fail(task, 500); return
        }
        respond(data: data, mimeType: "application/json", url: task.request.url!, task: task)
    }

    private func respond(data: Data, mimeType: String, url: URL, task: any WKURLSchemeTask) {
        let response = URLResponse(
            url: url,
            mimeType: mimeType,
            expectedContentLength: data.count,
            textEncodingName: "utf-8"
        )
        task.didReceive(response)
        task.didReceive(data)
        task.didFinish()
    }

    private func fail(_ task: any WKURLSchemeTask, _ code: Int) {
        task.didFailWithError(NSError(domain: "WizardingFrame", code: code))
    }

    private func mimeType(_ ext: String) -> String {
        switch ext.lowercased() {
        case "html":        return "text/html; charset=utf-8"
        case "css":         return "text/css"
        case "js":          return "application/javascript"
        case "json":        return "application/json"
        case "jpg", "jpeg": return "image/jpeg"
        case "png":         return "image/png"
        case "gif":         return "image/gif"
        case "webp":        return "image/webp"
        case "heic":        return "image/heic"
        case "avif":        return "image/avif"
        case "mp4":         return "video/mp4"
        case "mov":         return "video/quicktime"
        case "m4v":         return "video/x-m4v"
        default:            return "application/octet-stream"
        }
    }
}
