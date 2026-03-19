import AppKit

@objc(ConfigureSheetController)
final class ConfigureSheetController: NSObject {

    let window: NSWindow
    private let onChange: (URL) -> Void

    private var selectedURL: URL
    private var isICloud: Bool

    private var icloudRadio: NSButton!
    private var localRadio: NSButton!
    private var pathLabel: NSTextField!
    private var browseButton: NSButton!

    init(currentURL: URL?, onChange: @escaping (URL) -> Void) {
        self.onChange = onChange
        self.selectedURL = currentURL ?? WizardingFrameView.defaultMediaFolder()
        self.isICloud = self.selectedURL.path.contains("com~apple~CloudDocs")

        let panel = NSPanel(
            contentRect: NSRect(x: 0, y: 0, width: 480, height: 230),
            styleMask: [.titled, .closable],
            backing: .buffered,
            defer: false
        )
        panel.title = "WizardingFrame Screensaver"
        self.window = panel

        super.init()
        buildUI()
    }

    // MARK: - UI

    private func buildUI() {
        let v = window.contentView!

        // Section label
        let sourceLabel = label("Media Source", bold: true)
        sourceLabel.frame = NSRect(x: 20, y: 190, width: 200, height: 20)
        v.addSubview(sourceLabel)

        // iCloud radio
        icloudRadio = makeRadio(title: "iCloud Drive  (~/iCloud Drive/WizardingFrame/)", tag: 0)
        icloudRadio.frame = NSRect(x: 20, y: 162, width: 440, height: 20)
        v.addSubview(icloudRadio)

        // Local radio
        localRadio = makeRadio(title: "Local Folder:", tag: 1)
        localRadio.frame = NSRect(x: 20, y: 134, width: 160, height: 20)
        v.addSubview(localRadio)

        // Path label
        pathLabel = NSTextField(labelWithString: "")
        pathLabel.font = .monospacedSystemFont(ofSize: 10, weight: .regular)
        pathLabel.textColor = .secondaryLabelColor
        pathLabel.lineBreakMode = .byTruncatingMiddle
        pathLabel.frame = NSRect(x: 20, y: 108, width: 350, height: 18)
        v.addSubview(pathLabel)

        // Browse button
        browseButton = NSButton(title: "Choose…", target: self, action: #selector(browse))
        browseButton.frame = NSRect(x: 378, y: 104, width: 84, height: 26)
        v.addSubview(browseButton)

        // Separator
        let sep = NSBox()
        sep.boxType = .separator
        sep.frame = NSRect(x: 0, y: 62, width: 480, height: 1)
        v.addSubview(sep)

        // Cancel
        let cancel = NSButton(title: "Cancel", target: self, action: #selector(cancelClicked))
        cancel.frame = NSRect(x: 292, y: 18, width: 90, height: 32)
        cancel.keyEquivalent = "\u{1b}"
        v.addSubview(cancel)

        // OK
        let ok = NSButton(title: "OK", target: self, action: #selector(okClicked))
        ok.frame = NSRect(x: 392, y: 18, width: 70, height: 32)
        ok.bezelStyle = .rounded
        ok.keyEquivalent = "\r"
        v.addSubview(ok)

        refresh()
    }

    private func label(_ text: String, bold: Bool = false) -> NSTextField {
        let tf = NSTextField(labelWithString: text)
        tf.font = bold ? .boldSystemFont(ofSize: 13) : .systemFont(ofSize: 13)
        return tf
    }

    private func makeRadio(title: String, tag: Int) -> NSButton {
        let btn = NSButton(frame: .zero)
        btn.setButtonType(.radio)
        btn.title = title
        btn.tag = tag
        btn.target = self
        btn.action = #selector(sourceChanged(_:))
        return btn
    }

    private func refresh() {
        icloudRadio.state = isICloud ? .on : .off
        localRadio.state  = isICloud ? .off : .on
        browseButton.isEnabled = !isICloud
        pathLabel.stringValue = isICloud ? iCloudFolderPath() : selectedURL.path
    }

    private func iCloudFolderPath() -> String {
        FileManager.default.homeDirectoryForCurrentUser
            .appendingPathComponent("Library/Mobile Documents/com~apple~CloudDocs/WizardingFrame")
            .path
    }

    // MARK: - Actions

    @objc private func sourceChanged(_ sender: NSButton) {
        isICloud = sender.tag == 0
        if isICloud {
            let url = URL(fileURLWithPath: iCloudFolderPath())
            try? FileManager.default.createDirectory(at: url, withIntermediateDirectories: true)
            selectedURL = url
        }
        refresh()
    }

    @objc private func browse() {
        let panel = NSOpenPanel()
        panel.canChooseDirectories = true
        panel.canChooseFiles = false
        panel.allowsMultipleSelection = false
        panel.message = "Choose the folder containing your photos and videos."
        panel.prompt = "Select"
        panel.directoryURL = selectedURL
        panel.begin { [weak self] response in
            guard let self, response == .OK, let url = panel.url else { return }
            self.selectedURL = url
            self.pathLabel.stringValue = url.path
        }
    }

    @objc private func okClicked() {
        onChange(selectedURL)
        window.orderOut(nil)
        window.sheetParent?.endSheet(window)
    }

    @objc private func cancelClicked() {
        window.orderOut(nil)
        window.sheetParent?.endSheet(window)
    }
}
