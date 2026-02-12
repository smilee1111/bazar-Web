import z from "zod";

export const roleSchema = z.object({
    roleId: z.string().optional(),
    roleName: z.string().min(2).max(50),
    status: z.enum(['active', 'inactive']).default('active')
});

export type RoleType = z.infer<typeof roleSchema>;
