import mongoose from 'mongoose';
import { IUserPopulated } from '../models/user.model';
import { ROLE_NAMES } from '../constants/roles';

/**
 * Checks if a user is an admin by verifying their populated roleId
 * @param user - The user object with potentially populated roleId
 * @returns true if the user is an admin, false otherwise
 */
export function isUserAdmin(user: IUserPopulated | undefined): boolean {
    if (!user || !user.roleId) {
        return false;
    }
    
    // Ensure roleId is populated (not just an ObjectId)
    if (user.roleId instanceof mongoose.Types.ObjectId) {
        return false;
    }
    
    if (!('roleName' in user.roleId)) {
        return false;
    }
    
    return user.roleId.roleName === ROLE_NAMES.ADMIN;
}
