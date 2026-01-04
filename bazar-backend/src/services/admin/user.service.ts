import { UserRepository } from "../../repositories/user.repository";
import { Request, Response} from "express";
import { CreateUserDto } from "../../dtos/user.dto";
import z from 'zod';
import bcryptjs from "bcryptjs";
import { HttpError } from "../../errors/http-error";

//initializing user repository
let userRepository = new UserRepository();

export class AdminUserService{
    async adminCreateUser(data: CreateUserDto){
        //logic to register user, duplicate check, hash
        const emailExists = await userRepository.getUserByEmail(data.email);
        if(emailExists){//if instance found, duplicate
            throw new HttpError(400, "Email already exists");
        }
        const usernameExists = await userRepository.getUserByUsername(data.username);
        if(usernameExists){
            throw new HttpError(400, "Username already exists");
        }
        //donot save plan text password, hash the password
        const hashedPassword = await bcryptjs.hash(data.password,10); //10 - complexity
        data.password=hashedPassword; //replacce plain text with hashed password
        const newUser = await userRepository.createUser(data);
        return newUser;
    }

     async getAllUsers() {
        //logic to get all users
        let users = await userRepository.getAllUsers();
        //transform data if needed
        return users;
    }

    async getUserById(userId: string){
        //logic to get user by id
        let user = await userRepository.getUserById(userId);
        if(!user){
            throw new HttpError(404,"User not found");
        }
        return user;
    }
    async updateUser(userId: string){
        //logic to update the user 
       await this.updateUser; 
    }

    async deleteUser(userId: string){
        await this.deleteUser;
    }

}
