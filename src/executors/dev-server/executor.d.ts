import { ExecutorContext } from '@nrwl/devkit';
import { DevServerExecutorSchema } from './schema';
export default function runExecutor(options: DevServerExecutorSchema, context: ExecutorContext): AsyncGenerator<{
    success: boolean;
    baseUrl: any;
}, void, unknown>;
