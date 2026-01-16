/**
 * User data type definitions for the frontend
 * Based on the backend IUser model
 */

export interface UserData {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: number;
    username: string;
    roleId?: string;
    createdAt?: string;
    updatedAt?: string;
}
