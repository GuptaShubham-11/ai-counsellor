import z from 'zod';

export const createAiSessionSchema = z.object({
  onboardingFormId: z.string('Onboarding form id is required'),
  profileSummary: z.string('Profile summary is required'),
  isProfileChanged: z.boolean().default(false).optional(),
});

export const updateAiSessionSchema = createAiSessionSchema.partial();

export type CreateAiSessionSchema = z.infer<typeof createAiSessionSchema>;
export type UpdateAiSessionSchema = z.infer<typeof updateAiSessionSchema>;

export const createAiMessageSchema = z.object({
  aiSessionId: z.string('AI session id is required'),
  role: z.enum(['user', 'ai']),
  content: z.string('Message is required'),
});

export const updateAiMessageSchema = createAiMessageSchema.partial();

export const deleteAiMessageSchema = z.object({
  id: z.string('Message id is required'),
});

export const getAiMessageSchema = z.object({
  aiSessionId: z.string('AI session id is required'),
});

export type CreateAiMessageSchema = z.infer<typeof createAiMessageSchema>;
export type UpdateAiMessageSchema = z.infer<typeof updateAiMessageSchema>;
export type DeleteAiMessageSchema = z.infer<typeof deleteAiMessageSchema>;
export type GetAiMessageSchema = z.infer<typeof getAiMessageSchema>;
