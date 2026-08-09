import z from 'zod';

export const RouteToShopQueryDto = z.object({
    fromLat: z.coerce.number().min(-90).max(90),
    fromLng: z.coerce.number().min(-180).max(180),
});

export type RouteToShopQueryDto = z.infer<typeof RouteToShopQueryDto>;
