import z from 'zod';
import { roleSchema } from "../types/role.type";

export const CreateRoleDto = roleSchema.pick({
    roleId: true,
    roleName: true,
    status: true,
});

export type CreateRoleDto = z.infer<typeof CreateRoleDto>;

export const UpdateRoleDto = roleSchema.partial();

export type UpdateRoleDto = z.infer<typeof UpdateRoleDto>;
