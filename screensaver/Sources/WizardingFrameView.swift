import ScreenSaver
import WebKit

@objc(WizardingFrameView)
final class WizardingFrameView: ScreenSaverView {

    private var webView: WKWebView!
    let handler = MediaSchemeHandler()
    private var sheetController: ConfigureSheetController?

    static let suiteName = "com.wizardingframe.saver"

    override init?(frame: NSRect, isPreview: Bool) {
        super.init(frame: frame, isPreview: isPreview)
        setup()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setup()
    }

    private func setup() {
        handler.mediaFolderURL = storedFolderURL()

        let wkConfig = WKWebViewConfiguration()
        wkConfig.setURLSchemeHandler(handler, forURLScheme: "wizarding")
        wkConfig.mediaTypesRequiringUserActionForPlayback = []

        webView = WKWebView(frame: bounds, configuration: wkConfig)
        webView.autoresizingMask = [.width, .height]
        addSubview(webView)

        loadPlayer()
    }

    private func loadPlayer() {
        webView.load(URLRequest(url: URL(string: "wizarding://player/index.html")!))
    }

    // MARK: - Animation

    override func startAnimation() {
        super.startAnimation()
    }

    override func stopAnimation() {
        super.stopAnimation()
    }

    override func animateOneFrame() {
        // WebView renders itself; nothing needed here.
    }

    // MARK: - Configure Sheet

    override var hasConfigureSheet: Bool { true }

    override var configureSheet: NSWindow? {
        if sheetController == nil {
            sheetController = ConfigureSheetController(
                currentURL: handler.mediaFolderURL,
                onChange: { [weak self] url in
                    guard let self else { return }
                    self.handler.mediaFolderURL = url
                    UserDefaults(suiteName: Self.suiteName)?.set(url.path, forKey: "mediaFolder")
                    self.loadPlayer()
                }
            )
        }
        return sheetController?.window
    }

    // MARK: - Persistence

    private func storedFolderURL() -> URL {
        let defaults = UserDefaults(suiteName: Self.suiteName)
        if let path = defaults?.string(forKey: "mediaFolder"),
           FileManager.default.fileExists(atPath: path) {
            return URL(fileURLWithPath: path)
        }
        return Self.defaultMediaFolder()
    }

    static func defaultMediaFolder() -> URL {
        let fm = FileManager.default
        let home = fm.homeDirectoryForCurrentUser

        // Prefer iCloud WizardingFrame folder if it exists
        let icloud = home
            .appendingPathComponent("Library/Mobile Documents/com~apple~CloudDocs")
            .appendingPathComponent("WizardingFrame")
        if fm.fileExists(atPath: icloud.path) { return icloud }

        // Fall back to ~/Pictures/WizardingFrame
        let local = home.appendingPathComponent("Pictures/WizardingFrame")
        try? fm.createDirectory(at: local, withIntermediateDirectories: true)
        return local
    }
}
