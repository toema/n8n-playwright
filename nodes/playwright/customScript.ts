import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';
import { makeResolverFromLegacyOptions, NodeVM } from '@n8n/vm2';

const {
	NODE_FUNCTION_ALLOW_BUILTIN: builtIn,
	NODE_FUNCTION_ALLOW_EXTERNAL: external,
	CODE_ENABLE_STDOUT,
} = process.env;

export const vmResolver = makeResolverFromLegacyOptions({
	external: external
		? {
				modules: external.split(','),
				transitive: false,
			}
		: false,
	builtin: builtIn?.split(',') ?? [],
});

export async function runCustomScript(
    executeFunctions: IExecuteFunctions,
    itemIndex: number,
    browser: any,
    page: any,
    playwright: any
): Promise<INodeExecutionData[]> {
    const scriptCode = executeFunctions.getNodeParameter('scriptCode', itemIndex) as string;

    // Create execution context with special variables
    const context = {
        $getNodeParameter: executeFunctions.getNodeParameter,
        $getWorkflowStaticData: executeFunctions.getWorkflowStaticData,
        helpers: {
            ...executeFunctions.helpers,
            httpRequestWithAuthentication: executeFunctions.helpers.httpRequestWithAuthentication?.bind(executeFunctions),
            requestWithAuthenticationPaginated: executeFunctions.helpers.requestWithAuthenticationPaginated?.bind(executeFunctions),
        },
        ...executeFunctions.getWorkflowDataProxy(itemIndex),
        $browser: browser,
        $page: page,
        $playwright: playwright,
        $helpers: executeFunctions.helpers,
    };

    // Use NodeVM for sandboxed execution
    const vm = new NodeVM({
        console: 'redirect',
        sandbox: context,
        require: vmResolver,
        wasm: false,
    });

    // Redirect console.log output
    vm.on(
        'console.log',
        executeFunctions.getMode() === 'manual'
            ? executeFunctions.sendMessageToUI
            : CODE_ENABLE_STDOUT === 'true'
                ? (...args: unknown[]) =>
                    console.log(`[Workflow "${executeFunctions.getWorkflow().id}"][Node "${executeFunctions.getNode().name}"]`, ...args)
                : () => {},
    );

    try {
        const scriptResult = await vm.run(
            `module.exports = async function() { ${scriptCode}\n}()`,
        );

        if (!Array.isArray(scriptResult)) {
            throw new NodeOperationError(
                executeFunctions.getNode(),
                'Custom script must return an array of items. Please ensure your script returns an array, e.g., return [{ key: value }];'
            );
        }

        return executeFunctions.helpers.normalizeItems(scriptResult);
    } catch (error) {
        if (executeFunctions.continueOnFail()) {
            return [{
                json: {
                    error: error.message,
                },
                pairedItem: {
                    item: itemIndex,
                },
            }];
        }
        throw new NodeOperationError(executeFunctions.getNode(), error.message);
    }
}