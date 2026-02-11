import axios from '../axios';//IMPORTANT: "./axios" not "axios"
import { API } from "../endpoints";

export const register = async (registerData: any) => {
  try {
    const response = 
    await axios.post(
      API.ADMIN_USERS.CREATE_USER,
      registerData,
      {
        headers: registerData instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : undefined,
      }
    );
    return response.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message ||
      err.message ||
      "Registration failed"
    );
  }
};



export const getAllUsers = async (page: number, size: number, search?: string
) => {
    try {
        const response = await axios.get(
            API.ADMIN_USERS.GET_ALL_USERS,//API path '/api/admin/users
        {   
             params: { page, size, search }
        }
        );
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Get all users failed');
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
        const response = await axios.put(endpoint, updateData, {
        headers: updateData instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : undefined,
    });

    return response.data;
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