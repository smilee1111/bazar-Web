import { ISellerApplication, SellerApplicationModel } from "../models/sellerApplication.model";

export interface ISellerApplicationRepository {
    createSellerApplication(data: Partial<ISellerApplication>): Promise<ISellerApplication>;
    getSellerApplicationById(id: string): Promise<ISellerApplication | null>;
    getSellerApplicationByUserId(userId: string): Promise<ISellerApplication | null>;
    getSellerApplicationByBusinessPhone(businessPhone: string): Promise<ISellerApplication | null>;
    getAllSellerApplications(): Promise<ISellerApplication[]>;
    getPendingSellerApplications(): Promise<ISellerApplication[]>;
    updateSellerApplication(id: string, data: Partial<ISellerApplication>): Promise<ISellerApplication | null>;
    deleteSellerApplication(id: string): Promise<boolean | null>;
}

export class SellerApplicationRepository implements ISellerApplicationRepository {
    async createSellerApplication(data: Partial<ISellerApplication>): Promise<ISellerApplication> {
        const newApplication = new SellerApplicationModel(data);
        await newApplication.save();
        return newApplication;
    }

    async getSellerApplicationById(id: string): Promise<ISellerApplication | null> {
        const application = await SellerApplicationModel.findById(id);
        return application;
    }

    async getSellerApplicationByUserId(userId: string): Promise<ISellerApplication | null> {
        const application = await SellerApplicationModel.findOne({ userId: userId });
        return application;
    }

    async getSellerApplicationByBusinessPhone(businessPhone: string): Promise<ISellerApplication | null> {
        const application = await SellerApplicationModel.findOne({ businessPhone: businessPhone });
        return application;
    }

    async getAllSellerApplications(): Promise<ISellerApplication[]> {
        const applications = await SellerApplicationModel.find();
        return applications;
    }

    async getPendingSellerApplications(): Promise<ISellerApplication[]> {
        const applications = await SellerApplicationModel.find({ status: 'pending' }).populate(
            'userId',
            'fullName email'
        );
        return applications;
    }

    async updateSellerApplication(id: string, data: Partial<ISellerApplication>): Promise<ISellerApplication | null> {
        const updatedApplication = await SellerApplicationModel.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
        return updatedApplication;
    }

    async deleteSellerApplication(id: string): Promise<boolean | null> {
        const result = await SellerApplicationModel.findByIdAndDelete(id);
        return result ? true : null;
    }
}