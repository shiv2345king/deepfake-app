import {z} from 'zod';

export const videoSchema = z.object({
    owner: z.string().uuid('Invalid owner ID'),
    originalUrl: z.string().url('Invalid URL'),
    processedUrl: z.string().url('Invalid URL').optional(),
    classification: z.enum(['Original', 'AI-Generated', 'Deepfake']),
    analyzedAt: z.date().optional(),
});