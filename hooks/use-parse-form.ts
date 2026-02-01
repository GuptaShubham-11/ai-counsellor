import z from 'zod';

export type Errors = Record<string, string | string[]>;

function useParseForm<TInput>(
  data: TInput,
  schema: any
): { errors: Errors; data?: z.infer<typeof schema> } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;

    const errors: Errors = {};
    for (const [field, msgs] of Object.entries(fieldErrors)) {
      errors[field as typeof fieldErrors] = Array.isArray(msgs)
        ? msgs[0]
        : msgs;
    }

    return { errors };
  }

  return {
    errors: {},
    data: result.data,
  };
}

export { useParseForm };
