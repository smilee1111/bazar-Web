import { UserRepository } from "../../repositories/auth.repository";
import { CreateUserDto, LoginUserDto } from "../../dtos/user.dto";
import bcryptjs from "bcryptjs";
import { HttpError } from "../../errors/http-error";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../../config";

let userRepository = new UserRepository();

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

        //hash the password before saving to database
        const hashedPassword = await bcryptjs.hash(data.password, 15);
        data.password = hashedPassword;
        
        //create the user finally 
        const newUser = await userRepository.createUser(data);
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
            role: user.role
        }//data to be stored in token 
        
        const token = jwt.sign(payload,JWT_SECRET, {expiresIn: '30d'});
        return{ token, user}

    }
}
