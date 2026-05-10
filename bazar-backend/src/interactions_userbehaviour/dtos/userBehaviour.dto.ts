import z from 'zod';

export const CreateUserBehaviourDto = z.object({
    shopId: z.string().min(1),
    eventType: z.enum(['view', 'save', 'favorite', 'search_click']),
    timestamp: z.coerce.date().optional(),
    userLocation: z
        .object({
            lat: z.number(),
            lng: z.number(),
        })
        .optional(),
});

export type CreateUserBehaviourDto = z.infer<typeof CreateUserBehaviourDto>;