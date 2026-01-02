import { INodeType, INodeExecutionData, IExecuteFunctions,INodeTypeDescription, NodeConnectionType, INodeInputConfiguration, INodeOutputConfiguration } from 'n8n-workflow';
import { join } from 'path';
import { platform } from 'os';
import { getBrowserExecutablePath } from './utils';
import { handleOperation } from './operations';
import { IBrowserOptions } from './types';
import { installBrowser } from '../scripts/setup-browsers';
import { BrowserType } from './config';

export class Playwright implements INodeType {
    description : INodeTypeDescription = {
    displayName: 'Playwright',
    name: 'playwright',
    icon: 'file:playwright.svg',
    group: ['automation'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Automate browser actions using Playwright',
    defaults: {
        name: 'Playwright',
    },
    // eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
    inputs: [
        {
            displayName: 'Input',
            type: NodeConnectionType.Main,
        } as INodeInputConfiguration,
    ],
    // eslint-disable-next-line n8n-nodes-base/node-class-description-outputs-wrong
    outputs: [
        {
            displayName: 'Output',
            type: NodeConnectionType.Main,
        } as INodeOutputConfiguration,
    ],

    properties: [
        {
            displayName: 'Operation',
            name: 'operation',
            type: 'options',
            noDataExpression: true,
            options: [
                {
                    name: 'Click Element',
                    value: 'clickElement',
                    description: 'Click on an element',
                    action: 'Click on an element',
                },
                {
                    name: 'Fill Form',
                    value: 'fillForm',
                    description: 'Fill a form field',
                    action: 'Fill a form field',
                },
                {
                    name: 'Get Text',
                    value: 'getText',
                    description: 'Get text from an element',
                    action: 'Get text from an element',
                },
                {
                    name: 'Navigate',
                    value: 'navigate',
                    description: 'Navigate to a URL',
                    action: 'Navigate to a URL',
                },
                {
                    name: 'Take Screenshot',
                    value: 'takeScreenshot',
                    description: 'Take a screenshot of a webpage',
                    action: 'Take a screenshot of a webpage',
                }
            ],
            default: 'navigate',
        },

        {
            displayName: 'URL',
            name: 'url',
            type: 'string',
            default: '',
            placeholder: 'https://example.com',
            description: 'The URL to navigate to',
            displayOptions: {
                show: {
                    operation: ['navigate', 'takeScreenshot', 'getText', 'clickElement', 'fillForm'],
                },
            },
            required: true,
        },
        {
            displayName: 'Property Name',
            name: 'dataPropertyName',
            type: 'string',
            required: true,
            default: 'screenshot',
            description: 'Name of the binary property in which to store the screenshot data',
            displayOptions: {
                show: {
                    operation: ['takeScreenshot'],
                },
            },
        },
        
        // Selector Type - NEW
        {
            displayName: 'Selector Type',
            name: 'selectorType',
            type: 'options',
            options: [
                {
                    name: 'CSS Selector',
                    value: 'css',
                    description: 'Use CSS selector (e.g., #submit-button, .my-class)',
                },
                {
                    name: 'XPath',
                    value: 'xpath',
                    description: 'Use XPath expression (e.g., //button[@id="submit"])',
                }
            ],
            default: 'css',
            description: 'Choose between CSS selector or XPath',
            displayOptions: {
                show: {
                    operation: ['getText', 'clickElement', 'fillForm'],
                },
            },
        },
        
        // CSS Selector field
        {
            displayName: 'CSS Selector',
            name: 'selector',
            type: 'string',
            default: '',
            placeholder: '#submit-button',
            description: 'CSS selector for the element (e.g., #id, .class, button[type="submit"])',
            displayOptions: {
                show: {
                    operation: ['getText', 'clickElement', 'fillForm'],
                    selectorType: ['css'],
                },
            },
            required: true,
        },
        
        // XPath field
        {
            displayName: 'XPath',
            name: 'xpath',
            type: 'string',
            default: '',
            placeholder: '//button[@id="submit"]',
            description: 'XPath expression for the element (e.g., //div[@class="content"], //button[text()="Click Me"])',
            displayOptions: {
                show: {
                    operation: ['getText', 'clickElement', 'fillForm'],
                    selectorType: ['xpath'],
                },
            },
            required: true,
        },
        
        {
            displayName: 'Value',
            name: 'value',
            type: 'string',
            default: '',
            description: 'Value to fill in the form field',
            displayOptions: {
                show: {
                    operation: ['fillForm'],
                },
            },
            required: true,
        },
        {
            displayName: 'Browser',
            name: 'browser',
            type: 'options',
            options: [
                {
                    name: 'Chromium',
                    value: 'chromium',
                },
                {
                    name: 'Firefox',
                    value: 'firefox',
                },
                {
                    name: 'Webkit',
                    value: 'webkit',
                },
            ],
            default: 'chromium',
        },
        {
            displayName: 'Browser Launch Options',
            name: 'browserOptions',
            type: 'collection',
            placeholder: 'Add Option',
            default: {},
            options: [
                {
                    displayName: 'Headless',
                    name: 'headless',
                    type: 'boolean',
                    default: true,
                    description: 'Whether to run browser in headless mode',
                },
                {
                    displayName: 'Slow Motion',
                    name: 'slowMo',
                    type: 'number',
                    default: 0,
                    description: 'Slows down operations by the specified amount of milliseconds',
                }
            ],
        },
        {
            displayName: 'Screenshot Options',
            name: 'screenshotOptions',
            type: 'collection',
            placeholder: 'Add Option',
            default: {},
            displayOptions: {
                show: {
                    operation: ['takeScreenshot'],
                },
            },
            options: [
                {
                    displayName: 'Full Page',
                    name: 'fullPage',
                    type: 'boolean',
                    default: false,
                    description: 'Whether to take a screenshot of the full scrollable page',
                },
                {
                    displayName: 'Path',
                    name: 'path',
                    type: 'string',
                    default: '',
                    description: 'The file path to save the screenshot to',
                },
            ],
        },
    ],
};

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        for (let i = 0; i < items.length; i++) {
            const operation = this.getNodeParameter('operation', i) as string;
            const url = this.getNodeParameter('url', i) as string;
            const browserType = this.getNodeParameter('browser', i) as BrowserType;
            const browserOptions = this.getNodeParameter('browserOptions', i) as IBrowserOptions;

            try {
                const playwright = require('playwright');
                const browsersPath = join(__dirname, '..', 'browsers');

                // Add better error handling for browser executable
                let executablePath;
                try {
                    executablePath = getBrowserExecutablePath(browserType, browsersPath);
                } catch (error) {
                    console.error(`Browser path error: ${error.message}`);
                    // Try to install missing browser
                    await installBrowser(browserType);
                    executablePath = getBrowserExecutablePath(browserType, browsersPath);
                }

                console.log(`Launching browser from: ${executablePath}`);

                const browser = await playwright[browserType].launch({
                    headless: browserOptions.headless !== false,
                    slowMo: browserOptions.slowMo || 0,
                    executablePath,
                });

                const context = await browser.newContext();
                const page = await context.newPage();
                await page.goto(url);

                const result = await handleOperation(operation, page, this, i);
                await browser.close();

                returnData.push(result);
            } catch (error) {
                console.error(`Browser launch error:`, error);
                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            error: error.message,
                            browserType,
                            os: platform(),
                        },
                    });
                    continue;
                }
                throw error;
            }
        }

        return [returnData];
    }
}