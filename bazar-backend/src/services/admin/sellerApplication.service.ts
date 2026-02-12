import { SellerApplicationRepository } from "../../repositories/sellerApplication.repository";
import { UserRepository } from "../../repositories/user.repository";
import { RoleRepository } from "../../repositories/role.repository";
import { ShopRepository } from "../../repositories/shop.repository";
import { CreateSellerApplicationDto, UpdateSellerApplicationDto } from "../../dtos/sellerApplication.dto";
import { HttpError } from "../../errors/http-error";

let sellerApplicationRepository = new SellerApplicationRepository();
let userRepository = new UserRepository();
let roleRepository = new RoleRepository();
let shopRepository = new ShopRepository();

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

        // Get seller role
        const sellerRole = await roleRepository.getRoleByRoleName('seller');
        if (!sellerRole) {
            throw new HttpError(500, "Seller role not found");
        }

        // Update user sellerStatus to approved and role to seller
        await userRepository.updateUser(application.userId.toString(), { sellerStatus: 'approved', roleId: sellerRole._id });

        // Auto-create shop from approved application if none exists
        const ownerId = application.userId.toString();
        const existingShop = await shopRepository.getShopByOwnerId(ownerId);
        if (!existingShop) {
            const baseName = (application.businessName || "").trim() || `Shop-${application._id.toString().slice(-6)}`;
            const baseSlug = baseName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            let shopName = baseName;
            let slug = baseSlug || `shop-${application._id.toString().slice(-6)}`;
            let attempts = 0;

            while (attempts < 3) {
                try {
                    await shopRepository.createShop({
                        ownerId,
                        shopName,
                        slug,
                        shopAddress: application.businessAddress,
                        shopContact: application.businessPhone,
                        description: application.description,
                    });
                    break;
                } catch (err: any) {
                    if (err?.code === 11000 && attempts < 2) {
                        attempts += 1;
                        shopName = `${baseName}-${application._id.toString().slice(-4)}-${attempts}`;
                        slug = `${baseSlug || "shop"}-${application._id.toString().slice(-4)}-${attempts}`;
                        continue;
                    }
                    throw err;
                }
            }
        }

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