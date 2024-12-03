import { INodeType, INodeExecutionData, IExecuteFunctions } from 'n8n-workflow';
import { join } from 'path';
import { platform } from 'os';
import { nodeDescription } from './description';
import { getBrowserExecutablePath } from './utils';
import { handleOperation } from './operations';
import { IBrowserOptions } from './types';

export class PlaywrightNode implements INodeType {
    description = nodeDescription;
    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];
        
        for (let i = 0; i < items.length; i++) {
            const operation = this.getNodeParameter('operation', i) as string;
            const url = this.getNodeParameter('url', i) as string;
            const browserType = this.getNodeParameter('browser', i) as string;
            const browserOptions = this.getNodeParameter('browserOptions', i) as IBrowserOptions;

            try {
                const playwright = require('playwright');
                const browsersPath = join(__dirname, '..','browsers');
                const executablePath = getBrowserExecutablePath(browserType, browsersPath);

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

                returnData.push({ json: result });
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
