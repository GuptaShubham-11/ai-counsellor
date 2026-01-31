import z from 'zod';

export const createCourseSchema = z.object({
  name: z.string('Name is required'),
  universityId: z.string('University id is required'),
  degree: z.enum(['bachelor', 'master', 'phd'], 'Degree is required'),
  duration: z.number('Duration is required'),
  tutionFee: z.number('Tution fee is required'),
});

export const updateCourseSchema = createCourseSchema.partial();

export type CreateCourseSchema = z.infer<typeof createCourseSchema>;
export type UpdateCourseSchema = z.infer<typeof updateCourseSchema>;
