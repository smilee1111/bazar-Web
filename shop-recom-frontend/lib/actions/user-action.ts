"use server";

import { completeOnboarding, getUserProfile } from "../api/user/user";
import { setUserData } from "../cookie";

export const handleCompleteOnboarding = async (data: { categoryIds: string[]; location?: { lat: number; lng: number } }) => {
    try {
        const result = await completeOnboarding(data);
        if (result.success && result.data) {
            // Update the user data in cookies so the context gets the new hasCompletedOnboarding flag
            await setUserData(result.data);
            return {
                success: true,
                message: result.message || "Onboarding completed successfully",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Failed to complete onboarding"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to complete onboarding"
        };
    }
}
