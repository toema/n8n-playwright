# n8n-nodes-playwright

This is an n8n community node. It lets you automate browser actions using Playwright in your n8n workflows.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)

[Operations](#operations)

[Compatibility](#compatibility)

[Resources](#resources)

[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

```bash
pnpm install n8n-nodes-playwright

```

Note: The package will automatically download and set up the required browser binaries during installation. This requires approximately 1GB of disk space.

If you need to manually trigger the browser setup:

```bash
pnpm rebuild n8n-nodes-playwright

```

Operations
----------

This node supports the following operations:

-   Navigate: Go to a specified URL
-   Take Screenshot: Capture a screenshot of a webpage
-   Get Text: Extract text from an element using CSS selector
-   Click Element: Click on an element using CSS selector
-   Fill Form: Fill a form field using CSS selector

### Browser Options

-   Choose between Chromium, Firefox, or WebKit
-   Configure headless mode
-   Adjust operation speed with slow motion option

### Screenshot Options

-   Full page capture
-   Custom save path
-   Base64 output

Compatibility
-------------

-   Requires n8n version 1.0.0 or later
-   Tested with Playwright version 1.49.0
-   Supports Windows, macOS, and Linux

### System Requirements

-   Node.js 18.10 or later
-   Approximately 1GB disk space for browser binaries
-   Additional system dependencies may be required for browser automation

Resources
---------

-   [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
-   [Playwright documentation](https://playwright.dev/docs/intro)

Version history
---------------

### 0.1.*

-   Initial release
-   Basic browser automation operations
-   Support for Chromium, Firefox, and WebKit.
-   Screenshot and form interaction capabilities

### Troubleshooting

If browsers are not installed correctly:

1.  Clean the installation:

```bash
rm -rf ~/.cache/ms-playwright
# or for Windows:
rmdir /s /q %USERPROFILE%\AppData\Local\ms-playwright

```

1.  Rebuild the package:

```bash
pnpm rebuild n8n-nodes-playwright

```

### License

[MIT](https://github.com/n8n-io/n8n-nodes-starter/blob/master/LICENSE.md)
