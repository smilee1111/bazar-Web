//API layer
//Call api from backend

import axios from './axios';//IMPORTANT: "./axios" not "axios"
import { API } from "./endpoints";

export const register = async (registerData: any) => {
    try{
        const response = await axios.post(
            API.AUTH.REGISTER,//API path '/api/auth/register
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

export const login = async (loginData: any) => {
        try{
        const response = await axios.post(
            API.AUTH.LOGIN,//API path '/api/auth/login
            loginData//body data
        );
        return response.data;//what the backend-controller returns
    }catch(err: Error | any){
        throw new Error(
            err.response?.data?.message || err.message//message from backend 
            || "Login failed"//fallback messae 

        );
    }
}

export const whoami = async () => {
    try{
        const response = await axios.get(
            API.AUTH.WHOAMI,//API path '/api/auth/whoami
        );
        return response.data;//what the backend-controller returns
    }catch(err: Error | any){
        throw new Error(
            err.response?.data?.message || err.message//message from backend 
            || "Failed to fetch user data"//fallback messae 

        );
    }
}

export const updateProfile = async (userId: string, updateData: FormData) => {
    try{
        const response = await axios.put(
            typeof API.AUTH.UPDATE_BY_ID === 'function' ? API.AUTH.UPDATE_BY_ID(userId) : `${API.AUTH.UPDATEPROFILE}/${userId}`,
            updateData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data' // IMPORTANT: multer
                }
            }
        );
        return response.data;
    }catch(err: Error | any){
        throw new Error(
            err.response?.data?.message 
            || err.message  
            || "Failed to update profile" 
        );
    }
}