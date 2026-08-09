import z from "zod";

export const notificationSchema = z.object({
    notificationId: z.string().optional(),
    userId: z.union([z.string(), z.any()]), // User receiving the notification
    type: z.enum([
        'review_like',           // Someone liked your review
        'review_dislike',        // Someone disliked your review
        'new_shop',              // New shop added (for all users)
        'shop_reviewed',         // Your shop received a review (for sellers)
        'seller_application',    // New seller application (for admins)
        'general'                // General notifications
    ]),
    title: z.string().min(1),
    message: z.string().min(1),
    relatedEntityId: z.string().optional(), // ID of related shop, review, etc.
    relatedEntityType: z.enum(['shop', 'review', 'user']).optional(),
    isRead: z.boolean().default(false),
    metadata: z.record(z.string(), z.any()).optional(), // Additional data (e.g., shop name, reviewer name)
});

export type NotificationType = z.infer<typeof notificationSchema>;
