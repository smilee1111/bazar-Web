import { UserRepository } from "../../repositories/user.repository";
import { RoleRepository } from "../../repositories/role.repository";
import { CreateUserDto, LoginUserDto, UpdateUserDto} from "../../dtos/user.dto";
import bcryptjs from "bcryptjs";
import { HttpError } from "../../errors/http-error";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../../config";

let userRepository = new UserRepository();
let roleRepository = new RoleRepository();

export class AuthService{
    async registerUser(data: CreateUserDto){

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

        // Find the role by roleName (either 'user' or 'seller')
        const role = await roleRepository.getRoleByRoleName(data.role);
        if(!role){
            throw new HttpError(400, "Invalid role selected.");
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
        return newUser;
    }

    async loginUser(data: LoginUserDto){
        
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

        //generate the JWT token 
        const payload = {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.roleId
        }//data to be stored in token 
        
        const token = jwt.sign(payload,JWT_SECRET, {expiresIn: '30d'});
        return{ token, user}
    }

    async getUserById(userId: string){
        if(!userId){
            throw new HttpError(400, "User ID is required");
        }
        const user = await userRepository.getUserById(userId);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        return user;
    }

   async updateUser(userId: string, data: UpdateUserDto){
        const user = await userRepository.getUserById(userId);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        if(user.email !== data.email){
            const emailExists = await userRepository.getUserByEmail(data.email!);
            if(emailExists){
                throw new HttpError(409, "Email already exists");
            }
        }
        if(user.username !== data.username){
            const usernameExists = await userRepository.getUserByUsername(data.username!);
            if(usernameExists){
                throw new HttpError(409, "Username already exists");
            }
        }
        if(data.password){
            const hashedPassword = await bcryptjs.hash(data.password, 10);
            data.password = hashedPassword;
        }
        const updatedUser = await userRepository.updateUser(userId, data);
        return updatedUser;
    }



}
