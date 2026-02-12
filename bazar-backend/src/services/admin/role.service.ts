import { RoleRepository } from "../../repositories/role.repository";
import { CreateRoleDto, UpdateRoleDto } from "../../dtos/role.dto";
import { HttpError } from "../../errors/http-error";

// Initializing role repository
let roleRepository = new RoleRepository();

export class AdminRoleService {
    async adminCreateRole(data: CreateRoleDto) {
        // Check provided roleId for duplicates only when supplied by client
        if (data.roleId) {
            const roleIdExists = await roleRepository.getRoleByRoleId(data.roleId);
            if (roleIdExists) {
                throw new HttpError(400, "Role ID already exists");
            }
        }

        // Check if roleName already exists
        const roleNameExists = await roleRepository.getRoleByRoleName(data.roleName);
        if (roleNameExists) {
            throw new HttpError(400, "Role name already exists");
        }

        const newRole = await roleRepository.createRole(data);
        return newRole;
    }

    async getAllRoles() {
        const roles = await roleRepository.getAllRoles();
        return roles;
    }

    async getRoleById(roleId: string) {
        const role = await roleRepository.getRoleById(roleId);
        if (!role) {
            throw new HttpError(404, "Role not found");
        }
        return role;
    }

    async updateRole(roleId: string, data: UpdateRoleDto) {
        // Check if role exists
        const role = await roleRepository.getRoleById(roleId);
        if (!role) {
            throw new HttpError(404, "Role not found");
        }

        // If updating roleId, check for duplicates
        if (data.roleId && data.roleId !== role.roleId) {
            const roleIdExists = await roleRepository.getRoleByRoleId(data.roleId);
            if (roleIdExists) {
                throw new HttpError(400, "Role ID already exists");
            }
        }

        // If updating roleName, check for duplicates
        if (data.roleName && data.roleName !== role.roleName) {
            const roleNameExists = await roleRepository.getRoleByRoleName(data.roleName);
            if (roleNameExists) {
                throw new HttpError(400, "Role name already exists");
            }
        }

        const updatedRole = await roleRepository.updateRole(roleId, data);
        return updatedRole;
    }

    async deleteRole(roleId: string) {
        const role = await roleRepository.getRoleById(roleId);
        if (!role) {
            throw new HttpError(404, "Role not found");
        }

        const result = await roleRepository.deleteRole(roleId);
        return result;
    }
}
