import { AdminRoleService } from '../../services/admin/role.service';
import z from 'zod';
import { Request, Response } from 'express';
import { CreateRoleDto, UpdateRoleDto } from "../../dtos/role.dto";
import mongoose from 'mongoose';

let roleService = new AdminRoleService();

export class AdminRoleController {
    async createRole(req: Request, res: Response) {
        try {
            const parsedData = CreateRoleDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedData.error)
                });
            }
            const newRole = await roleService.adminCreateRole(parsedData.data);
            return res.status(201).json({
                success: true,
                data: newRole,
                message: "Role created successfully."
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error."
            });
        }
    }

    async getAllRoles(req: Request, res: Response) {
        try {
        console.log('=== Getting Roles ===');
        console.log('Database:', mongoose.connection.name);
        console.log('Collection:', mongoose.connection.collections.roles?.collectionName);
    
            // Check if user is authenticated and is admin
            const userRole = req.user?.roleId as any;
            const isAdmin = req.user && userRole && userRole.roleName === 'admin';
            
            const allRoles = await roleService.getAllRoles();
             console.log('Roles count:', allRoles?.length);
         console.log('Roles data:', JSON.stringify(allRoles, null, 2));
    
            let roles;
            if (isAdmin) {
                // Admin sees all roles
                roles = allRoles;
            } else {
                // Public/non-admin users see only 'user' and 'seller' roles (not 'admin')
                roles = allRoles.filter(role => 
                    role.roleName !== 'admin'
                );
            }
            
            return res.status(200).json({
                success: true,
                data: roles,
                message: "Roles retrieved successfully."
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error."
            });
        }
    }

    async getRoleById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const role = await roleService.getRoleById(id);
            return res.status(200).json({
                success: true,
                data: role,
                message: "Role retrieved successfully."
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error."
            });
        }
    }

    async updateRole(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const parsedData = UpdateRoleDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedData.error)
                });
            }
            const updatedRole = await roleService.updateRole(id, parsedData.data);
            return res.status(200).json({
                success: true,
                data: updatedRole,
                message: "Role updated successfully."
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error."
            });
        }
    }

    async deleteRole(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await roleService.deleteRole(id);
            return res.status(200).json({
                success: true,
                message: "Role deleted successfully."
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error."
            });
        }
    }
}
