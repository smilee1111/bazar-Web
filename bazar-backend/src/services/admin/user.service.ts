import { UserRepository } from "../../repositories/user.repository";
import type { CreateUserDto as CreateUserInput, UpdateUserDto as UpdateUserInput } from "../../dtos/user.dto";
import bcryptjs from "bcryptjs";
import { HttpError } from "../../errors/http-error";
import { RoleRepository } from "../../repositories/role.repository";
import { sanitizeUser, SafeUser } from "../../utils/user.util";
import { IUser } from "../../models/user.model";

//initializing user repository
let userRepository = new UserRepository();
let roleRepository = new RoleRepository();

export class AdminUserService{
    private async resolveRole(roleName?: string) {
        const normalizedRole = roleName?.toLowerCase() || 'user';
        const role = await roleRepository.getRoleByRoleName(normalizedRole);
        if(!role){
            throw new HttpError(400, "Invalid role selected");
        }
        if(role.status !== 'active'){
            throw new HttpError(403, "Selected role is inactive");
        }
        return role;
    }

    private async ensureUniqueFields(data: Partial<IUser>, userIdToExclude?: string) {
        if(data.email){
            const emailExists = await userRepository.getUserByEmail(data.email);
            if(emailExists && emailExists._id.toString() !== userIdToExclude){
                throw new HttpError(400, "Email already exists");
            }
        }

        if(data.username){
            const usernameExists = await userRepository.getUserByUsername(data.username);
            if(usernameExists && usernameExists._id.toString() !== userIdToExclude){
                throw new HttpError(400, "Username already exists");
            }
        }
    }

    async adminCreateUser(data: CreateUserInput): Promise<SafeUser>{
        await this.ensureUniqueFields({ email: data.email, username: data.username });
        const role = await this.resolveRole(data.role);

        const hashedPassword = await bcryptjs.hash(data.password,10); //10 - complexity
        const newUser = await userRepository.createUser({
            fullName: data.fullName,
            email: data.email,
            phoneNumber: data.phoneNumber,
            username: data.username,
            password: hashedPassword,
            profilePic: data.profilePic,
            roleId: role._id
        });
        return sanitizeUser(newUser);
    }

     async getAllUsers(): Promise<SafeUser[]> {
        const users = await userRepository.getAllUsers();
        return users.map(user => sanitizeUser(user));
    }

    async getUserById(userId: string): Promise<SafeUser>{
        const user = await userRepository.getUserById(userId);
        if(!user){
            throw new HttpError(404,"User not found");
        }
        return sanitizeUser(user);
    }
    async updateUser(userId: string, data: UpdateUserInput): Promise<SafeUser>{
        const existingUser = await userRepository.getUserById(userId);
        if(!existingUser){
            throw new HttpError(404,"User not found");
        }

        await this.ensureUniqueFields({
            email: data.email,
            username: data.username,
        }, userId);

        const updatePayload: Partial<IUser> = { ...data };
        if(data.password){
            updatePayload.password = await bcryptjs.hash(data.password, 10);
        }

        if(data.role){
            const role = await this.resolveRole(data.role);
            updatePayload.roleId = role._id;
        }

        delete (updatePayload as any).role;

        const updatedUser = await userRepository.updateUser(userId, updatePayload);
        if(!updatedUser){
            throw new HttpError(404, "User not found");
        }
        return sanitizeUser(updatedUser);
    }

    async deleteUser(userId: string){
        const deleted = await userRepository.deleteUser(userId);
        if(!deleted){
            throw new HttpError(404, "User not found");
        }
        return true;
    }

}
