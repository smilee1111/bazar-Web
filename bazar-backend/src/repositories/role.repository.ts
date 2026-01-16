import { IRole, RoleModel } from "../models/role.model";

export interface IRoleRepository {
    // Create a role
    createRole(data: Partial<IRole>): Promise<IRole>;

    // Get role by roleId
    getRoleByRoleId(roleId: string): Promise<IRole | null>;

    // Get role by roleName
    getRoleByRoleName(roleName: string): Promise<IRole | null>;

    // Get role by _id
    getRoleById(id: string): Promise<IRole | null>;

    // Get all roles
    getAllRoles(): Promise<IRole[]>;

    // Update a role
    updateRole(id: string, data: Partial<IRole>): Promise<IRole | null>;

    // Delete a role
    deleteRole(id: string): Promise<boolean | null>;
}

export class RoleRepository implements IRoleRepository {
    async createRole(data: Partial<IRole>): Promise<IRole> {
        const newRole = new RoleModel(data);
        await newRole.save();
        return newRole;
    }

    async getRoleByRoleId(roleId: string): Promise<IRole | null> {
        const role = await RoleModel.findOne({ roleId: roleId });
        return role;
    }

    async getRoleByRoleName(roleName: string): Promise<IRole | null> {
        const role = await RoleModel.findOne({ roleName: roleName });
        return role;
    }

    async getRoleById(id: string): Promise<IRole | null> {
        const role = await RoleModel.findById(id);
        return role;
    }

    async getAllRoles(): Promise<IRole[]> {
        console.log('Repository: getAllRoles called');
    console.log('Model name:', RoleModel.modelName);
    console.log('Collection name:', RoleModel.collection.name);
    console.log('Connection state:', RoleModel.db.readyState); // 1 = connected
    // Try raw collection query first
    const rawCount = await RoleModel.collection.countDocuments({});
    console.log('Raw collection count:', rawCount);
    
    const roles = await RoleModel.find();
    console.log('Query result count:', roles.length);
    
        return roles;
    }

    async updateRole(id: string, data: Partial<IRole>): Promise<IRole | null> {
        const updatedRole = await RoleModel.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
        return updatedRole;
    }

    async deleteRole(id: string): Promise<boolean | null> {
        const result = await RoleModel.findByIdAndDelete(id);
        return result ? true : null;
    }
}
