import { IExecuteFunctions } from 'n8n-workflow';
import { Page } from 'playwright';

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
            return {
                json: {
                    content: content,
                    url: url
                },
                pairedItem: {
                    item: itemIndex
                }
            };

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
            const selectorType = executeFunctions.getNodeParameter('selectorType', itemIndex) as string;
            const textSelector = selectorType === 'css' 
                ? executeFunctions.getNodeParameter('selector', itemIndex) as string
                : executeFunctions.getNodeParameter('xpath', itemIndex) as string;
            
            let textElement;
            if (selectorType === 'css') {
                textElement = await page.$(textSelector);
            } else {
                textElement = await page.locator(`xpath=${textSelector}`).first();
            }
            
            const text = selectorType === 'css' 
                ? await textElement?.textContent()
                : await textElement?.textContent();
            
            return {
                json: {
                    text,
                    selectorType,
                    selector: textSelector
                },
                pairedItem: {
                    item: itemIndex
                }
            };

        case 'clickElement':
            const clickSelectorType = executeFunctions.getNodeParameter('selectorType', itemIndex) as string;
            const clickSelector = clickSelectorType === 'css'
                ? executeFunctions.getNodeParameter('selector', itemIndex) as string
                : executeFunctions.getNodeParameter('xpath', itemIndex) as string;
            
            if (clickSelectorType === 'css') {
                await page.click(clickSelector);
            } else {
                await page.locator(`xpath=${clickSelector}`).click();
            }
            
            return {
                json: {
                    success: true,
                    selectorType: clickSelectorType,
                    selector: clickSelector
                },
                pairedItem: {
                    item: itemIndex
                }
            };

        case 'fillForm':
            const formSelectorType = executeFunctions.getNodeParameter('selectorType', itemIndex) as string;
            const formSelector = formSelectorType === 'css'
                ? executeFunctions.getNodeParameter('selector', itemIndex) as string
                : executeFunctions.getNodeParameter('xpath', itemIndex) as string;
            const value = executeFunctions.getNodeParameter('value', itemIndex) as string;
            
            if (formSelectorType === 'css') {
                await page.fill(formSelector, value);
            } else {
                await page.locator(`xpath=${formSelector}`).fill(value);
            }
            
            return {
                json: {
                    success: true,
                    selectorType: formSelectorType,
                    selector: formSelector,
                    value
                },
                pairedItem: {
                    item: itemIndex
                }
            };

        default:
            throw new Error(`Unknown operation: ${operation}`);
    }
}