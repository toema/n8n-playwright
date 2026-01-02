# n8n-nodes-playwright

This is an n8n community node. It lets you automate browser actions using Playwright in your n8n workflows.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Custom Scripts](#custom-scripts)  
[Compatibility](#compatibility)  
[Resources](#resources)  
[Version history](#version-history)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

```bash
pnpm install n8n-nodes-playwright
```

**Note:** The package will automatically download and set up the required browser binaries during installation. This requires approximately 1GB of disk space.

If you need to manually trigger the browser setup:

```bash
pnpm rebuild n8n-nodes-playwright
```

## Operations

This node supports the following operations:

### Standard Operations

- **Navigate**: Go to a specified URL and retrieve page content
- **Take Screenshot**: Capture a screenshot of a webpage (full page or viewport)
- **Get Text**: Extract text from an element using CSS selector or XPath
- **Click Element**: Click on an element using CSS selector or XPath
- **Fill Form**: Fill a form field using CSS selector or XPath
- **Run Custom Script**: Execute custom JavaScript code with full Playwright API access

### Browser Options

- Choose between **Chromium**, **Firefox**, or **WebKit**
- Configure **headless mode**
- Adjust operation speed with **slow motion** option

### Selector Options

For `Get Text`, `Click Element`, and `Fill Form` operations, you can choose between:

- **CSS Selector**: Standard CSS selectors (e.g., `#submit-button`, `.my-class`, `button[type="submit"]`)
- **XPath**: XPath expressions (e.g., `//button[@id="submit"]`, `//div[contains(@class, "content")]`)

### Screenshot Options

- Full page capture
- Custom save path
- Base64 output

## Custom Scripts

The **Run Custom Script** operation gives you complete control over Playwright to automate complex browser interactions, scrape data, generate PDFs/screenshots, and more. Scripts run in a sandboxed environment with access to the full Playwright API and n8n's Code node features.

### Available Variables

Access Playwright-specific objects using:

- `$page` - Current page instance
- `$browser` - Browser instance
- `$playwright` - Playwright library
- `$helpers` - n8n helper methods (including `prepareBinaryData`)

Plus all special variables and methods from the Code node are available:
- `$json` - Current item's JSON data
- `$input` - Access to input data
- `$getNodeParameter()` - Get node parameters
- And more from [n8n documentation](https://docs.n8n.io/code-examples/methods-variables-reference/)

### Script Examples

#### Basic Navigation and Data Extraction

```javascript
// Navigate to a URL
await $page.goto('https://example.com');

// Get page title and content
const title = await $page.title();
const content = await $page.textContent('body');

console.log('Page title:', title);

// Return results
return [{
    json: { 
        title,
        content,
        url: $page.url()
    }
}];
```

#### Web Scraping with Selectors

```javascript
await $page.goto('https://news.ycombinator.com');

// Scrape all story titles
const stories = await $page.$$eval('.titleline > a', elements => 
    elements.map(el => ({
        title: el.textContent,
        url: el.href
    }))
);

console.log(`Found ${stories.length} stories`);

return stories.map(story => ({ json: story }));
```

#### Form Automation

```javascript
await $page.goto('https://example.com/login');

// Fill form fields
await $page.fill('#username', 'myuser');
await $page.fill('#password', 'mypass');

// Click submit button
await $page.click('button[type="submit"]');

// Wait for navigation
await $page.waitForNavigation();

console.log('Logged in successfully');

return [{
    json: {
        success: true,
        finalUrl: $page.url()
    }
}];
```

#### Taking Screenshots as Binary Data

```javascript
await $page.goto('https://www.google.com');

// Take screenshot
const screenshot = await $page.screenshot({ 
    type: 'png',
    fullPage: true 
});

// Prepare binary data
const binaryData = await $helpers.prepareBinaryData(
    Buffer.from(screenshot),
    'screenshot.png',
    'image/png'
);

return [{
    json: {
        url: $page.url(),
        timestamp: new Date().toISOString()
    },
    binary: {
        screenshot: binaryData
    }
}];
```

#### Storing and Reusing Cookies

**Script 1 - Login and Save Cookies**

```javascript
await $page.goto('https://www.example.com/login');

// Perform login
await $page.fill('#login-username', 'user');
await $page.fill('#login-password', 'pass');
await $page.click('#login-button');

// Wait for login to complete
await $page.waitForNavigation();

// Get browser context and save cookies
const context = $page.context();
const cookies = await context.cookies();

console.log('Login successful, cookies saved');

return [{
    json: { 
        cookies,
        loginSuccess: true
    }
}];
```

**Script 2 - Restore Cookies and Access Protected Page**

```javascript
const { cookies } = $input.first().json;

// Create new context with saved cookies
const context = $page.context();
await context.addCookies(cookies);

// Navigate to authenticated page
await $page.goto('https://example.com/protected-page');

// Perform authenticated operations
const data = await $page.textContent('.protected-content');

console.log('Accessed protected page successfully');

return [{
    json: { 
        data,
        authenticated: true
    }
}];
```

#### Advanced: Multiple Operations

```javascript
await $page.goto('https://example.com/products');

// Wait for products to load
await $page.waitForSelector('.product-item');

// Get all product data
const products = await $page.$$eval('.product-item', items =>
    items.map(item => ({
        name: item.querySelector('.product-name')?.textContent,
        price: item.querySelector('.product-price')?.textContent,
        image: item.querySelector('img')?.src
    }))
);

// Take a screenshot
const screenshot = await $page.screenshot({ type: 'png' });
const screenshotBinary = await $helpers.prepareBinaryData(
    Buffer.from(screenshot),
    'products.png',
    'image/png'
);

console.log(`Scraped ${products.length} products`);

return [{
    json: { 
        products,
        scrapedAt: new Date().toISOString(),
        totalProducts: products.length
    },
    binary: {
        screenshot: screenshotBinary
    }
}];
```

#### Using XPath Selectors

```javascript
await $page.goto('https://example.com');

// Use XPath to find elements
const button = await $page.locator('xpath=//button[contains(text(), "Submit")]');
await button.click();

// XPath for complex selections
const items = await $page.locator('xpath=//div[@class="item" and @data-active="true"]').all();
const itemTexts = await Promise.all(items.map(item => item.textContent()));

console.log(`Found ${itemTexts.length} active items`);

return [{
    json: {
        activeItems: itemTexts
    }
}];
```

#### Error Handling

```javascript
try {
    await $page.goto('https://example.com');
    
    // Try to find element with timeout
    const element = await $page.waitForSelector('.my-element', { 
        timeout: 5000 
    });
    
    const text = await element.textContent();
    
    return [{
        json: { 
            success: true,
            text 
        }
    }];
} catch (error) {
    console.error('Error occurred:', error.message);
    
    return [{
        json: {
            success: false,
            error: error.message
        }
    }];
}
```

#### Working with Multiple Pages

```javascript
// Open a new page
const newPage = await $browser.newPage();
await newPage.goto('https://example.com/page2');

// Work with both pages
const page1Title = await $page.title();
const page2Title = await newPage.title();

console.log('Page 1:', page1Title);
console.log('Page 2:', page2Title);

// Close the new page
await newPage.close();

return [{
    json: {
        page1Title,
        page2Title
    }
}];
```

#### Generating PDFs

```javascript
await $page.goto('https://example.com');

// Generate PDF
const pdf = await $page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
    }
});

// Prepare binary data
const binaryData = await $helpers.prepareBinaryData(
    Buffer.from(pdf),
    'document.pdf',
    'application/pdf'
);

return [{
    json: {
        url: $page.url(),
        timestamp: new Date().toISOString()
    },
    binary: {
        pdf: binaryData
    }
}];
```

#### Waiting for Dynamic Content

```javascript
await $page.goto('https://example.com');

// Wait for network to be idle
await $page.waitForLoadState('networkidle');

// Wait for specific element to appear
await $page.waitForSelector('.dynamic-content', { timeout: 10000 });

// Wait for element to be visible
await $page.locator('.modal').waitFor({ state: 'visible' });

// Extract data after everything has loaded
const content = await $page.textContent('.dynamic-content');

return [{
    json: { content }
}];
```

#### Handling File Downloads

```javascript
await $page.goto('https://example.com/downloads');

// Start waiting for download before clicking
const downloadPromise = $page.waitForEvent('download');
await $page.click('#download-button');

const download = await downloadPromise;

// Get download details
const fileName = download.suggestedFilename();
const downloadPath = await download.path();

console.log(`Downloaded: ${fileName}`);

return [{
    json: {
        fileName,
        downloadPath,
        success: true
    }
}];
```

### Custom Script Tips

1. **Always return an array**: Your script must return an array of objects like `return [{ json: {...} }];`
2. **Use console.log()**: Debug by logging to the console - output appears in n8n UI during manual execution
3. **Handle errors**: Use try-catch for robust scripts
4. **Binary data**: Use `$helpers.prepareBinaryData()` for images, PDFs, or other files
5. **Async/await**: All Playwright operations are async, always use `await`
6. **Access input data**: Use `$json` or `$input` to access data from previous nodes
7. **Browser cleanup**: The browser is automatically closed after script execution

## Compatibility

- Requires n8n version 1.0.0 or later
- Tested with Playwright version 1.49.0
- Supports Windows, macOS, and Linux

### System Requirements

- Node.js 18.10 or later
- Approximately 1GB disk space for browser binaries
- Additional system dependencies may be required for browser automation

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Playwright documentation](https://playwright.dev/docs/intro)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)

## Version history

### 0.3.0

- Added **Run Custom Script** operation with full Playwright API access
- Added **XPath selector** support for Get Text, Click Element, and Fill Form operations
- Added sandboxed JavaScript execution environment
- Improved error handling and user feedback
- Fixed navigate operation to return page content properly

### 0.2.*

- Added selector-based operations (getText, clickElement, fillForm)
- Improved browser binary installation process
- Bug fixes and performance improvements

### 0.1.*

- Initial release
- Basic browser automation operations
- Support for Chromium, Firefox, and WebKit
- Screenshot and navigation capabilities

## Troubleshooting

### Browsers Not Installed

If browsers are not installed correctly:

1. Clean the installation:

```bash
rm -rf ~/.cache/ms-playwright
# or for Windows:
rmdir /s /q %USERPROFILE%\AppData\Local\ms-playwright
```

2. Rebuild the package:

```bash
pnpm rebuild n8n-nodes-playwright
```

### Custom Script Errors

If your custom script fails:

1. Check that you're returning an array: `return [{ json: {...} }];`
2. Use `console.log()` to debug and see output in n8n UI
3. Wrap code in try-catch blocks for better error handling
4. Verify all Playwright operations use `await`

### Selector Not Found

If elements can't be found:

1. Try using XPath instead of CSS selector (or vice versa)
2. Use `await $page.waitForSelector('selector')` to wait for elements
3. Check if content is in an iframe: `await $page.frameLocator('iframe').locator('selector')`
4. Verify the page has fully loaded: `await $page.waitForLoadState('networkidle')`

## License

[MIT](https://github.com/n8n-io/n8n-nodes-starter/blob/master/LICENSE.md)

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [Playwright documentation](https://playwright.dev/docs/intro)
3. Open an issue on [GitHub](https://github.com/toema/n8n-playwright/issues)

## Author

**Mohamed Toema**  
Email: m.toema20@gmail.com  
GitHub: [@toema](https://github.com/toema)