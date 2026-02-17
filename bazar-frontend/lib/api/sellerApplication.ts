//API layer for seller application operations
//Call api from backend

import axios from './axios';
import { API } from "./endpoints";

export const createSellerApplication = async (applicationData: any) => {
    try {
        const response = await axios.post(
            API.SELLER_APPLICATIONS.CREATE_APPLICATION,
            applicationData
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message
            || "Failed to create seller application"
        );
    }
}

export const createMySellerApplication = async (applicationData: any) => {
    try {
        const response = await axios.post(
            API.USER_SELLER_APPLICATIONS.CREATE_APPLICATION,
            applicationData
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message
            || "Failed to create seller application"
        );
    }
}

export const getMySellerApplication = async () => {
    try {
        const response = await axios.get(
            API.USER_SELLER_APPLICATIONS.GET_MY_APPLICATION
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message
            || "Failed to fetch seller application"
        );
    }
}

export const getAllSellerApplications = async () => {
    try {
        const response = await axios.get(
            API.SELLER_APPLICATIONS.GET_ALL_APPLICATIONS
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message
            || "Failed to fetch seller applications"
        );
    }
}

export const getPendingSellerApplications = async () => {
    try {
        const response = await axios.get(
            API.SELLER_APPLICATIONS.GET_PENDING_APPLICATIONS
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message
            || "Failed to fetch pending applications"
        );
    }
}

export const getSellerApplicationById = async (id: string) => {
    try {
        const response = await axios.get(
            API.SELLER_APPLICATIONS.GET_APPLICATION_BY_ID(id)
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message
            || "Failed to fetch seller application"
        );
    }
}

export const approveSellerApplication = async (id: string, adminRemark?: string) => {
    try {
        const response = await axios.put(
            API.SELLER_APPLICATIONS.APPROVE_APPLICATION(id),
            { adminRemark }
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message
            || "Failed to approve seller application"
        );
    }
}

export const rejectSellerApplication = async (id: string, adminRemark?: string) => {
    try {
        const response = await axios.put(
            API.SELLER_APPLICATIONS.REJECT_APPLICATION(id),
            { adminRemark }
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message
            || "Failed to reject seller application"
        );
    }
}

export const updateSellerApplication = async (id: string, applicationData: any) => {
    try {
        const response = await axios.put(
            API.SELLER_APPLICATIONS.UPDATE_APPLICATION(id),
            applicationData
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message
            || "Failed to update seller application"
        );
    }
}

export const deleteSellerApplication = async (id: string) => {
    try {
        const response = await axios.delete(
            API.SELLER_APPLICATIONS.DELETE_APPLICATION(id)
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message || err.message
            || "Failed to delete seller application"
        );
    }
}