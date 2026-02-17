import { SellerApplicationRepository } from "../../repositories/sellerApplication.repository";
import { UserRepository } from "../../repositories/user.repository";
import { CreateSellerApplicationDto } from "../../dtos/sellerApplication.dto";
import { HttpError } from "../../errors/http-error";

let sellerApplicationRepository = new SellerApplicationRepository();
let userRepository = new UserRepository();

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
            return updatedApplication;
        }

        await userRepository.updateUser(data.userId, { sellerStatus: "pending" });
        const newApplication = await sellerApplicationRepository.createSellerApplication(data);
        return newApplication;
    }
}
