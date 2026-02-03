import { UserRepository } from "../../repositories/user.repository";
import { RoleRepository } from "../../repositories/role.repository";
import { Request, Response} from "express";
import { CreateUserDto, UpdateUserDto } from "../../dtos/user.dto";
import z from 'zod';
import bcryptjs from "bcryptjs";
import { HttpError } from "../../errors/http-error";

//initializing user repository
let userRepository = new UserRepository();
let roleRepository = new RoleRepository();

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
        // resolve role -> roleId
        const roleDoc = data.role ? await roleRepository.getRoleByRoleName(data.role) : null;
        if (data.role && !roleDoc) {
            throw new HttpError(400, "Invalid role");
        }

        //donot save plan text password, hash the password
        const hashedPassword = await bcryptjs.hash(data.password,10); //10 - complexity
        data.password=hashedPassword; //replacce plain text with hashed password

        const newUser = await userRepository.createUser({
            ...data,
            roleId: roleDoc?._id
        });
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
   async AdminUpdateUser(userId: string, data: UpdateUserDto){
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

          if (data.role) {
              const roleDoc = await roleRepository.getRoleByRoleName(data.role);
              if (!roleDoc) {
                  throw new HttpError(400, "Invalid role");
              }
              (data as any).roleId = roleDoc._id;
          }

          const updatedUser = await userRepository.updateUser(userId, data);
          return updatedUser;
      }

      
    async deleteUser(userId: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) throw new HttpError(404, "User not found");
        await userRepository.deleteUser(userId);
        return true;
    }

}
