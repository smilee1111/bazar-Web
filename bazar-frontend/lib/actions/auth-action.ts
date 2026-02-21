"use server";   

//server side processing of auth actions 
import { setAuthToken, setUserData } from "../cookie";
import { register, login, whoami,updateProfile, requestPasswordReset, resetPassword} from "../api/auth";
import { revalidatePath } from "next/cache";

export const handleRegister = async (formData: any) =>{
    try{
        //how to get data from component
        const result = await register(formData);
        //how to send back to component
        if(result.success){
            return{
                success: true,
                message: "Registration successful",
                data: result.data
            };
        }
        return {
            success: false, message: result.message || "Registration failed"
        };
    }catch(err: Error | any){
        return {
            success: false,
            message: err.message || "Registration failed"
        };
    }
}

export const handleLogin = async (formData: any) =>{
    try{
        //how to get data from component
        const result = await login(formData);
        //how to send back to component
        if(result.success){
            await setAuthToken(result.token);
            await setUserData(result.data);
            return{
                success: true,
                message: "Login successful",
                data: result.data
            };
        }
        return {
            success: false, message: result.message || "Login failed"
        };
    }catch(err: Error | any){
        return {
            success: false,
            message: err.message || "Login failed"
        };
    }
}

export const handleWhoAmI = async () => {
    try{
        const result = await whoami();
        if(result.success){
            return {
                success: true,
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch user data"
        };
    }catch(err: Error | any){
        return {
            success: false,
            message: err.message || "Failed to fetch user data"
        };
    }   
}

export const handleUpdateProfile = async (formData: any) => {
    try{
        const result = await updateProfile(formData);
        if(result.success){
            // update cookie data
            await setUserData(result.data);
            // optionally revalidate path(s)
            revalidatePath("/user/profile");
            return {
                success: true,
                message: "Profile updated successfully",
                data: result.data 
            };
        }
        return {
            success: false, message: result.message || "Failed to update profile"
        }
    }catch(err: Error | any){
        return { success: false, message: err.message || "Failed to update profile"};
    }
}

    export const handleRequestPasswordReset = async (email: string) => {
        try {
            const response = await requestPasswordReset(email);
            if (response.success) {
                return {
                    success: true,
                    message: 'Password reset email sent successfully'
                }
            }
            return { success: false, message: response.message || 'Request password reset failed' }
        } catch (error: Error | any) {
            return { success: false, message: error.message || 'Request password reset action failed' }
        }
    };

    export const handleResetPassword = async (token: string, newPassword: string, confirmPassword: string) => {
        try {
            const response = await resetPassword(token, newPassword, confirmPassword);
            if (response.success) {
                return {
                    success: true,
                    message: 'Password has been reset successfully'
                }
            }
            return { success: false, message: response.message || 'Reset password failed' }
        } catch (error: Error | any) {
            return { success: false, message: error.message || 'Reset password action failed' }
        }
    };