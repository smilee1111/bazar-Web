import z from 'zod';
import { sellerApplicationSchema } from "../types/sellerApplication.type";

export const CreateSellerApplicationDto = sellerApplicationSchema.pick({
    userId: true,
    businessName: true,
    businessPhone: true,
    businessAddress: true,
    description: true,
    documentUrl: true,
});

export type CreateSellerApplicationDto = z.infer<typeof CreateSellerApplicationDto>;

export const UpdateSellerApplicationDto = sellerApplicationSchema.partial();
export type UpdateSellerApplicationDto = z.infer<typeof UpdateSellerApplicationDto>;
