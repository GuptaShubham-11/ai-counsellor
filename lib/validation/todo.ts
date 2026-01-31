import z from 'zod';

export const createTodoSchema = z.object({
  createdBy: z.enum(['user', 'ai'], 'Created by is required'),
  title: z.string('Title is required'),
  description: z.string('Description is required'),
  status: z.enum(['pending', 'completed'], 'Status is required'),
});

export const updateTodoSchema = createTodoSchema.partial();

export const deleteTodoSchema = z.object({
  id: z.string('Todo id is required'),
});

export type CreateTodoSchema = z.infer<typeof createTodoSchema>;
export type UpdateTodoSchema = z.infer<typeof updateTodoSchema>;
export type DeleteTodoSchema = z.infer<typeof deleteTodoSchema>;
