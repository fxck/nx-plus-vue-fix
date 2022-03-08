import { LibraryExecutorSchema } from './schema';
import { ExecutorContext } from '@nrwl/devkit';
export default function runExecutor(options: LibraryExecutorSchema, context: ExecutorContext): AsyncGenerator<{
    success: boolean;
    error?: undefined;
} | {
    success: boolean;
    error: any;
}, void, unknown>;
