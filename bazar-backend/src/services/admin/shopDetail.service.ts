import { HttpError } from "../../errors/http-error";
import { ShopDetailRepository } from "../../repositories/shopDetail.repository";

const shopDetailRepository = new ShopDetailRepository();

export class AdminShopDetailService {
    async getAllDetails() {
        // Admin can view all shop details
        const details = await shopDetailRepository.getAllDetails();
        return details;
    }

    async getDetailById(detailId: string) {
        const existing = await shopDetailRepository.getDetailById(detailId);
        if (!existing) {
            throw new HttpError(404, "Shop detail not found");
        }
        return existing;
    }

    async deleteDetail(detailId: string) {
        const existing = await shopDetailRepository.getDetailById(detailId);
        if (!existing) {
            throw new HttpError(404, "Shop detail not found");
        }
        const result = await shopDetailRepository.deleteDetail(detailId);
        return result;
    }
}
