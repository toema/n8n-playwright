import { IExecuteFunctions } from 'n8n-workflow';
import {  Page } from 'playwright';

export async function handleOperation(
    operation: string,
    page: Page,
    executeFunctions: IExecuteFunctions,
    itemIndex: number
): Promise<any> {
    switch (operation) {
        case 'navigate':
            return { content: page.content(), url:page.url() };

        case 'takeScreenshot':
            const screenshotOptions = executeFunctions.getNodeParameter('screenshotOptions', itemIndex) as object;
            const screenshot = await page.screenshot(screenshotOptions);
            return { screenshot: screenshot.toString('base64') };

        case 'getText':
            const selector = executeFunctions.getNodeParameter('selector', itemIndex) as string;
            const element = await page.$(selector);
            const text = await element?.textContent();
            return { text };

        case 'clickElement':
            const clickSelector = executeFunctions.getNodeParameter('selector', itemIndex) as string;
            await page.click(clickSelector);
            return { success: true };

        case 'fillForm':
            const formSelector = executeFunctions.getNodeParameter('selector', itemIndex) as string;
            const value = executeFunctions.getNodeParameter('value', itemIndex) as string;
            await page.fill(formSelector, value);
            return { success: true };

        default:
            throw new Error(`Unknown operation: ${operation}`);
    }
}
