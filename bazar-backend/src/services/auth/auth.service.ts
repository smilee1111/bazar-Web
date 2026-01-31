import { UserRepository } from "../../repositories/user.repository";
import { RoleRepository } from "../../repositories/role.repository";
import type { CreateUserDto as CreateUserInput, LoginUserDto as LoginUserInput, UpdateUserDto as UpdateUserInput } from "../../dtos/user.dto";
import bcryptjs from "bcryptjs";
import { HttpError } from "../../errors/http-error";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../../config";
import { sanitizeUser } from "../../utils/user.util";
import { IUser } from "../../models/user.model";

let userRepository = new UserRepository();
let roleRepository = new RoleRepository();

export class AuthService{
    async registerUser(data: CreateUserInput){

        //register a user, check constraints and hash the password

        //check is email is already registered
        const emailExists = await userRepository.getUserByEmail(data.email);
        if(emailExists){
            throw new HttpError(400, " Email already registered.");
        }
        const usernameExists = await userRepository.getUserByUsername(data.username);
        if(usernameExists){
            throw new HttpError(400, "Username already registered.");
        }

        if (!["user", "seller"].includes(data.role)) {
            throw new HttpError(403, "Cannot register with this role.");
        }

        // Find the role by roleName (either 'user' or 'seller')
        const role = await roleRepository.getRoleByRoleName(data.role);
        if(!role){
            throw new HttpError(400, "Invalid role selected.");
        }
        if(role.status !== 'active'){
            throw new HttpError(403, "Selected role is currently inactive.");
        }
        //hash the password before saving to database
        const hashedPassword = await bcryptjs.hash(data.password, 15);
        
        //create the user with roleId
        const newUser = await userRepository.createUser({
            fullName: data.fullName,
            email: data.email,
            phoneNumber: data.phoneNumber,
            username: data.username,
            password: hashedPassword,
            profilePic: data.profilePic,
            roleId: role._id
        });
        const safeUser = sanitizeUser(newUser);
        if(!safeUser.role){
            throw new HttpError(500, "Failed to load user role");
        }

        const payload = {
            id: safeUser._id,
            email: safeUser.email,
            username: safeUser.username,
            role: safeUser.role,           
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

        return {
            token,
            user: safeUser,
        };

    }

    async loginUser(data: LoginUserInput){
        
        //check if the user with that email exists
        const user = await userRepository.getUserByEmail(data.email);
        if(!user){
            throw new HttpError(404, "User not found");
        }

        //check for the validity of the password 
        const validPassword = await await bcryptjs.compare(data.password,user.password);
        if(!validPassword){
            throw new HttpError(401, "Invalid credentials");
        }
        const safeUser = sanitizeUser(user);
        if(!safeUser.role){
            throw new HttpError(500, "User has no associated role");
        }
        //generate the JWT token 
        const payload = {
            id: safeUser._id,
            email: safeUser.email,
            username: safeUser.username,
            role: safeUser.role,
        }//data to be stored in token 
        
        const token = jwt.sign(payload,JWT_SECRET, {expiresIn: '30d'});
        return { token, user: safeUser };
    }

    async getUserById(userId: string){
        if(!userId){
            throw new HttpError(400, "User ID is required");
        }
        const user = await userRepository.getUserById(userId);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        return sanitizeUser(user);
    }

   async updateUser(userId: string, data: UpdateUserInput, options: { allowRoleUpdate?: boolean } = {}){
        const user = await userRepository.getUserById(userId);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        if(data.email && user.email !== data.email){
            const emailExists = await userRepository.getUserByEmail(data.email);
            if(emailExists){
                throw new HttpError(409, "Email already exists");
            }
        }
        if(data.username && user.username !== data.username){
            const usernameExists = await userRepository.getUserByUsername(data.username);
            if(usernameExists){
                throw new HttpError(409, "Username already exists");
            }
        }
        const updatePayload: Partial<IUser> = { ...data };
        if(data.password){
            updatePayload.password = await bcryptjs.hash(data.password, 10);
        }

        if(data.role){
            if(!options.allowRoleUpdate){
                throw new HttpError(403, "Not allowed to update role");
            }
            const role = await roleRepository.getRoleByRoleName(data.role);
            if(!role){
                throw new HttpError(400, "Invalid role selected");
            }
            updatePayload.roleId = role._id;
        }

        delete (updatePayload as any).role;

        const updatedUser = await userRepository.updateUser(userId, updatePayload);
        if(!updatedUser){
            throw new HttpError(404, "User not found");
        }
        return sanitizeUser(updatedUser);
    }



}
