// src/description.ts
import { INodeTypeDescription } from 'n8n-workflow';

export const nodeDescription: INodeTypeDescription = {
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
    inputs: ['main'],
    outputs: ['main'],
    properties: [
        {
            displayName: 'Operation',
            name: 'operation',
            type: 'options',
            noDataExpression: true,
            options: [
                {
                    name: 'Take Screenshot',
                    value: 'takeScreenshot',
                    description: 'Take a screenshot of a webpage',
                },
                {
                    name: 'Get Text',
                    value: 'getText',
                    description: 'Get text from an element',
                },
                {
                    name: 'Click Element',
                    value: 'clickElement',
                    description: 'Click on an element',
                },
                {
                    name: 'Fill Form',
                    value: 'fillForm',
                    description: 'Fill a form field',
                },
                {
                    name: 'Navigate',
                    value: 'navigate',
                    description: 'Navigate to a URL',
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
            displayName: 'Selector',
            name: 'selector',
            type: 'string',
            default: '',
            placeholder: '#submit-button',
            description: 'CSS selector for the element',
            displayOptions: {
                show: {
                    operation: ['getText', 'clickElement', 'fillForm'],
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
                    description: 'When true, takes a screenshot of the full scrollable page',
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
