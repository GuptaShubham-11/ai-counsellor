import { z } from 'zod';

export const createOnboardingFormSchema = z.object({
  academic: z.object({
    level: z.string().min(2, 'Level is required'),
    major: z.string().min(2, 'Major is required'),
    graduationYear: z.number().min(2000).max(2035),
    gpa: z.number().min(0).max(10).optional(),
  }),

  goals: z.object({
    degree: z.enum(['bachelor', 'master', 'phd']),
    field: z.string().min(2, 'Field is required'),
    intake: z.number().min(new Date().getFullYear()).max(2035),
    countries: z.array(z.string()).min(1, 'Select at least one country'),
  }),

  budget: z.object({
    yearly: z.enum([
      'under_10k',
      '10k_to_20k',
      '20k_to_30k',
      '30k_to_40k',
      'over_40k',
    ]),
    funding: z.enum(['self', 'loan', 'scholarship', 'other']),
  }),

  exams: z.object({
    ielts: z.enum(['not_started', 'planned', 'completed']),
    gre: z.enum(['not_started', 'planned', 'completed', 'not_required']),
    sop: z.enum(['not_started', 'draft', 'ready']),
  }),

  isComplete: z.boolean().optional(),
});

export const updateOnboardingFormSchema = createOnboardingFormSchema.partial();

export type CreateOnboardingForm = z.infer<typeof createOnboardingFormSchema>;
export type UpdateOnboardingForm = z.infer<typeof updateOnboardingFormSchema>;
