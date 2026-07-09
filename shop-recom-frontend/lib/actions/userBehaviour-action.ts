"use server";

import { logUserBehaviour, type UserBehaviourPayload } from "../api/user_behaviour";

const getErrorMessage = (err: unknown) => {
    if (err instanceof Error) return err.message;
    return "Unexpected error";
};

export const handleLogUserBehaviour = async (payload: UserBehaviourPayload) => {
    try {
        const result = await logUserBehaviour(payload);
        if (result?.success === false) {
            return { success: false, message: result.message || "Failed to log behaviour" };
        }
        return { success: true };
    } catch (err: unknown) {
        return { success: false, message: getErrorMessage(err) || "Failed to log behaviour" };
    }
};
