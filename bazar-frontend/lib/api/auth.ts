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

export const updateProfile = async (updateData: any) => {
    try{
        const response = await axios.put(
            API.AUTH.UPDATEPROFILE,
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

export const requestPasswordReset = async (email: string) => {
    try {
        const response = await axios.post(API.AUTH.REQUEST_PASSWORD_RESET, { email });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message || error.message || 'Request password reset failed');
    }
};

export const resetPassword = async (token: string, newPassword: string) => {
    try {
        const response = await axios.post(API.AUTH.RESET_PASSWORD(token), { newPassword: newPassword });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message || error.message || 'Reset password failed');
    }
}