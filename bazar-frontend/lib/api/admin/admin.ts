import axios from '../axios';//IMPORTANT: "./axios" not "axios"
import { API } from "../endpoints";

export const register = async (registerData: any) => {
    try{
        const response = await axios.post(
            API.ADMIN_USERS.CREATE_USER,//API path '/api/auth/register
            registerData//body data
        );
        return response.data;//what the backend-controller returns
    }catch(err: Error | any){
        throw new Error(
            err.response?.data?.message || err.message//message from backend 
            || "Registration failed"//fallback messae 

        );
    }
}


export const getAllUsers = async () => {
    try{
        const response = await axios.get(
            API.ADMIN_USERS.GET_ALL_USERS,//API path '/api/admin/users
        );
        return response.data;//what the backend-controller returns
    }catch(err: Error | any){
        throw new Error(
            err.response?.data?.message || err.message//message from backend 
            || "Failed to fetch users"//fallback messae
        );
    }
}


export const getUserById = async (userId: string) => {
    try{
        const endpoint = API.ADMIN_USERS.GET_USER_BY_ID.replace(':id', userId);
        const response = await axios.get(
            endpoint,//API path '/api/admin/users/:id
        );
        return response.data;//what the backend-controller returns
    }catch(err: Error | any){
        throw new Error(
            err.response?.data?.message || err.message//message from backend 
            || "Failed to fetch user"//fallback messae
        );
    }
}


export const updateUser = async (userId: string, updateData: any) => {
    try{
        const endpoint = API.ADMIN_USERS.UPDATE_USER.replace(':id', userId);   
        const response = await axios.put(
            endpoint,
            updateData
        );
        return response.data;//what the backend-controller returns
    }catch(err: Error | any){
        throw new Error(
            err.response?.data?.message || err.message//message from backend 
            || "Failed to update user"//fallback messae
        );
    }   
}

export const deleteUser = async (userId: string) => {
    try{
        const endpoint = API.ADMIN_USERS.DELETE_USER.replace(':id', userId);
        const response = await axios.delete(
            endpoint,
        );
        return response.data;//what the backend-controller returns
    }catch(err: Error | any){
        throw new Error(
            err.response?.data?.message || err.message//message from backend 
            || "Failed to delete user"//fallback messae
        );
    }  
}