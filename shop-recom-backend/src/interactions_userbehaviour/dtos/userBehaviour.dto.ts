import z from 'zod';

export const CreateUserBehaviourDto = z.object({
    shopId: z.string().min(1).optional(),
    eventType: z.enum(['view', 'save', 'favorite', 'search_click', 'search']),
    searchQuery: z.string().min(1).optional(),
    timestamp: z.coerce.date().optional(),
    userLocation: z
        .object({
            lat: z.number(),
            lng: z.number(),
        })
        .optional(),
}).superRefine((value, ctx) => {
    if (value.eventType === 'search' && !value.searchQuery) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'searchQuery is required for search events',
            path: ['searchQuery'],
        });
    }
    if (value.eventType !== 'search' && !value.shopId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'shopId is required for non-search events',
            path: ['shopId'],
        });
    }
});

export type CreateUserBehaviourDto = z.infer<typeof CreateUserBehaviourDto>;