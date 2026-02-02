import axios from '../axios';//IMPORTANT: "./axios" not "axios"
import { API } from "../endpoints";


export const updateUserProfile = async (userId: string, updateData: any) => {
    try{
        const endpoint = API.USERS_SELF.UPDATE_PROFILE.replace(':id', userId);
        const response = await axios.put(
            endpoint,
            updateData
        );
        return response.data;//what the backend-controller returns
    }   
    catch(err: Error | any){
        throw new Error(
            err.response?.data?.message || err.message//message from backend 
            || "Failed to update user profile"//fallback messae
        );
    }
}


export const getUserProfile = async () => {
    try{
        const response = await axios.get(
            API.USERS_SELF.GET_USER_PROFILE,//API path '/api/user/whoami
        );
        return response.data;//what the backend-controller returns
    }catch(err: Error | any){
        throw new Error(
            err.response?.data?.message || err.message//message from backend 
            || "Failed to fetch user profile"//fallback messae
        );
    }
}