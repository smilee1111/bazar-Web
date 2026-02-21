import { SellerApplicationRepository } from "../../repositories/sellerApplication.repository";
import { UserRepository } from "../../repositories/user.repository";
import { CreateSellerApplicationDto } from "../../dtos/sellerApplication.dto";
import { HttpError } from "../../errors/http-error";
import { NotificationHelperService } from "./notificationHelper.service";

let sellerApplicationRepository = new SellerApplicationRepository();
let userRepository = new UserRepository();
const notificationHelper = new NotificationHelperService();

export class UserSellerApplicationService {
    async getMySellerApplication(userId: string) {
        const application = await sellerApplicationRepository.getSellerApplicationByUserId(userId);
        return application;
    }

    async createMySellerApplication(data: CreateSellerApplicationDto) {
        const existingApplication = await sellerApplicationRepository.getSellerApplicationByUserId(data.userId);
        if (existingApplication && existingApplication.status !== "rejected") {
            throw new HttpError(400, "User already has a seller application");
        }

        const existingPhoneApplication = await sellerApplicationRepository.getSellerApplicationByBusinessPhone(data.businessPhone);
        if (
            existingPhoneApplication &&
            (!existingApplication || existingPhoneApplication._id.toString() !== existingApplication._id.toString())
        ) {
            throw new HttpError(400, "Business phone already in use");
        }

        if (existingApplication && existingApplication.status === "rejected") {
            await userRepository.updateUser(data.userId, { sellerStatus: "pending" });
            const updatedApplication = await sellerApplicationRepository.updateSellerApplication(
                existingApplication._id.toString(),
                {
                    ...data,
                    status: "pending",
                    adminRemark: null,
                }
            );
            
            // Notify admins about the resubmitted application
            if (updatedApplication) {
                try {
                    const applicationId = updatedApplication._id?.toString() || existingApplication._id.toString();
                    await notificationHelper.notifySellerApplication(
                        data.userId,
                        applicationId,
                        data.businessName
                    );
                } catch (error) {
                    console.error('Failed to send seller application notification:', error);
                }
            }
            
            return updatedApplication;
        }

        await userRepository.updateUser(data.userId, { sellerStatus: "pending" });
        const newApplication = await sellerApplicationRepository.createSellerApplication(data);
        
        // Notify admins about the new application
        try {
            const applicationId = newApplication._id?.toString() || '';
            await notificationHelper.notifySellerApplication(
                data.userId,
                applicationId,
                data.businessName
            );
        } catch (error) {
            console.error('Failed to send seller application notification:', error);
        }
        
        return newApplication;
    }
}
