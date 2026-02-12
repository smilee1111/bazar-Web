import { SellerApplicationRepository } from "../../repositories/sellerApplication.repository";
import { UserRepository } from "../../repositories/user.repository";
import { CreateSellerApplicationDto, UpdateSellerApplicationDto } from "../../dtos/sellerApplication.dto";
import { HttpError } from "../../errors/http-error";

let sellerApplicationRepository = new SellerApplicationRepository();
let userRepository = new UserRepository();

export class AdminSellerApplicationService {
    async createSellerApplication(data: CreateSellerApplicationDto) {
        // Check if user already has an application
        const existingApplication = await sellerApplicationRepository.getSellerApplicationByUserId(data.userId);
        if (existingApplication) {
            throw new HttpError(400, "User already has a seller application");
        }

        // Update user sellerStatus to pending
        await userRepository.updateUser(data.userId, { sellerStatus: 'pending' });

        const newApplication = await sellerApplicationRepository.createSellerApplication(data);
        return newApplication;
    }

    async getAllSellerApplications() {
        const applications = await sellerApplicationRepository.getAllSellerApplications();
        return applications;
    }

    async getPendingSellerApplications() {
        const applications = await sellerApplicationRepository.getPendingSellerApplications();
        return applications;
    }

    async getSellerApplicationById(id: string) {
        const application = await sellerApplicationRepository.getSellerApplicationById(id);
        if (!application) {
            throw new HttpError(404, "Seller application not found");
        }
        return application;
    }

    async approveSellerApplication(id: string, adminRemark?: string) {
        const application = await sellerApplicationRepository.getSellerApplicationById(id);
        if (!application) {
            throw new HttpError(404, "Seller application not found");
        }

        if (application.status !== 'pending') {
            throw new HttpError(400, "Application is not pending");
        }

        // Update application status
        const updateData: Partial<UpdateSellerApplicationDto> = { status: 'approved' };
        if (adminRemark) {
            updateData.adminRemark = adminRemark;
        }
        const updatedApplication = await sellerApplicationRepository.updateSellerApplication(id, updateData);

        // Update user sellerStatus to approved
        await userRepository.updateUser(application.userId.toString(), { sellerStatus: 'approved' });

        return updatedApplication;
    }

    async rejectSellerApplication(id: string, adminRemark?: string) {
        const application = await sellerApplicationRepository.getSellerApplicationById(id);
        if (!application) {
            throw new HttpError(404, "Seller application not found");
        }

        if (application.status !== 'pending') {
            throw new HttpError(400, "Application is not pending");
        }

        // Update application status
        const updateData: Partial<UpdateSellerApplicationDto> = { status: 'rejected' };
        if (adminRemark) {
            updateData.adminRemark = adminRemark;
        }
        const updatedApplication = await sellerApplicationRepository.updateSellerApplication(id, updateData);

        // Update user sellerStatus to rejected
        await userRepository.updateUser(application.userId.toString(), { sellerStatus: 'rejected' });

        return updatedApplication;
    }

    async updateSellerApplication(id: string, data: UpdateSellerApplicationDto) {
        const application = await sellerApplicationRepository.getSellerApplicationById(id);
        if (!application) {
            throw new HttpError(404, "Seller application not found");
        }

        const updatedApplication = await sellerApplicationRepository.updateSellerApplication(id, data);
        return updatedApplication;
    }

    async deleteSellerApplication(id: string) {
        const application = await sellerApplicationRepository.getSellerApplicationById(id);
        if (!application) {
            throw new HttpError(404, "Seller application not found");
        }

        const result = await sellerApplicationRepository.deleteSellerApplication(id);
        return result;
    }
}