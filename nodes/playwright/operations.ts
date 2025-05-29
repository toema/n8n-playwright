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
					 const content = await page.content();
            const url = page.url();
            return { content: content, url:url };

        case 'takeScreenshot':
           const screenshotOptions = executeFunctions.getNodeParameter('screenshotOptions', itemIndex);
    const dataPropertyName = executeFunctions.getNodeParameter('dataPropertyName', itemIndex) || 'screenshot';
    const screenshot = await page.screenshot(screenshotOptions as any);

    // Prepare binary data using n8n's helper
    const binaryData = await executeFunctions.helpers.prepareBinaryData(
        Buffer.from(screenshot),
        (screenshotOptions as { path?: string }).path || dataPropertyName,
        'image/png'
    );

    return {
        binary: {
            [dataPropertyName]: binaryData
        },
        json: {
            success: true,
            url: page.url()
        },
        pairedItem: {
            item: itemIndex
        }
    };

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
