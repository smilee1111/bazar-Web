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
            || "Registration failed"//fallback message 

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
            || "Login failed"//fallback message 

        );
    }
}