import { IUser, UserModel } from "../models/user.model";
import { RoleModel } from "../models/role.model";
import { QueryFilter } from "mongoose";
export interface IUserRepository{

    //create a user 
    createUser(data: Partial<IUser>): Promise<IUser>;

    //get user by their email
    getUserByEmail(email: string): Promise<IUser | null>;

    //get user by their username
    getUserByUsername(username: string): Promise<IUser | null>;

    //get user by their id
    getUserById(id: string): Promise<IUser | null>;

    //get all users at once
    getAllUsers(page: number, size: number, search?: string): Promise<{users: IUser[], total: number}>;

    //update a user
    updateUser(id: string, data: Partial<IUser>): Promise<IUser | null>;

    //delete a user
    deleteUser(id: string): Promise<boolean |null>;
    
    getUserByRoleName(roleName: string): Promise<IUser[]>;
}

export class UserRepository implements IUserRepository{
    
    async getUserByRoleName(roleName: string): Promise<IUser[]> {
        const role = await RoleModel.findOne({ roleName });
        if (!role) {
            return [];
        }
        const users = await UserModel.find({ roleId: role._id })
            .populate({ path: 'roleId', select: 'roleId roleName status' });
        return users;
    }


    async createUser(data: Partial<IUser>): Promise<IUser> {
        const newUser = new UserModel(data);
        await newUser.save();
        return newUser;
    }
    async getUserByEmail(email: string): Promise<IUser | null> {
        const user = await UserModel.findOne({"email": email});
        return user;
    }

    async getUserByUsername(username: string): Promise<IUser | null> {
        const user = await UserModel.findOne({"username" : username});
        return user;
    }

    async getUserById(id: string): Promise<IUser | null> {
        return UserModel.findById(id).populate({ path: 'roleId', select: 'roleId roleName status' });
    }

    async getAllUsers( 
        page: number, size: number, search?: string
    ): Promise<{users: IUser[], total: number}> {
        const filter: QueryFilter<IUser> = {};
        if (search) {
            filter.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
            ];
        }
        const  [users, total] = await Promise.all([
            UserModel.find(filter)
                .skip((page - 1) * size)
                .limit(size)
                .populate({ path: 'roleId', select: 'roleId roleName status' }), 
                UserModel.countDocuments(filter)
        ]);
        return { users, total };
    }

    async updateUser(id: string, data: Partial<IUser>): Promise<IUser | null> {
        const updatedUser = await UserModel.findByIdAndUpdate(id, data, { new : true })
        .populate({ path: 'roleId', select: 'roleId roleName status' });
        return updatedUser;
    }

    async deleteUser(id: string): Promise<boolean | null> {
        const result = await UserModel.findByIdAndDelete(id);
        return result ? true : false;
    }

}