import z from "zod";

// DTO for creating a notification
export const createNotificationDto = z.object({
    userId: z.string().min(1, "User ID is required"),
    type: z.enum(['review_like', 'review_dislike', 'new_shop', 'shop_reviewed', 'seller_application', 'general']),
    title: z.string().min(1, "Title is required"),
    message: z.string().min(1, "Message is required"),
    relatedEntityId: z.string().optional(),
    relatedEntityType: z.enum(['shop', 'review', 'user']).optional(),
    metadata: z.record(z.string(), z.any()).optional(),
});

export type CreateNotificationDto = z.infer<typeof createNotificationDto>;

// DTO for updating a notification (mainly marking as read)
export const updateNotificationDto = z.object({
    isRead: z.boolean().optional(),
});

export type UpdateNotificationDto = z.infer<typeof updateNotificationDto>;

// DTO for marking multiple notifications as read
export const markMultipleAsReadDto = z.object({
    notificationIds: z.array(z.string()).min(1, "At least one notification ID is required"),
});

export type MarkMultipleAsReadDto = z.infer<typeof markMultipleAsReadDto>;
