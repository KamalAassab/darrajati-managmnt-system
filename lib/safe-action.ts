import { z } from 'zod';

export type ActionState<T = void> = {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Record<string, string[]>;
    fieldErrors?: Record<string, string[]>;
};

export async function handleActionError(error: unknown): Promise<ActionState<any>> {
    console.error('Action Error:', error);

    if (error instanceof z.ZodError) {
        // Convert Zod errors to dot notation for nested paths
        const fieldErrors: Record<string, string[]> = {};
        for (const issue of error.issues) {
            const path = issue.path.join('.');
            if (!fieldErrors[path]) {
                fieldErrors[path] = [];
            }
            fieldErrors[path].push(issue.message);
        }
        return {
            success: false,
            message: 'Validation failed',
            fieldErrors,
        };
    }

    if (error instanceof Error) {
        return {
            success: false,
            message: error.message,
        };
    }

    return {
        success: false,
        message: 'An unexpected error occurred',
    };
}
