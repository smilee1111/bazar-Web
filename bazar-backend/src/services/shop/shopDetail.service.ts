import { CreateShopDetailDto, UpdateShopDetailDto } from "../../dtos/shopDetail.dto";
import { HttpError } from "../../errors/http-error";
import { ShopRepository } from "../../repositories/shop.repository";
import { ShopDetailRepository } from "../../repositories/shopDetail.repository";

const shopRepository = new ShopRepository();
const shopDetailRepository = new ShopDetailRepository();

const normalizeShopIds = (shopId: string, resolvedShop: { shopId?: string; _id?: { toString(): string } }) => {
    const ids = new Set<string>();
    if (shopId) ids.add(String(shopId));
    if (resolvedShop.shopId) ids.add(String(resolvedShop.shopId));
    if (resolvedShop._id) ids.add(resolvedShop._id.toString());
    const canonicalShopId = resolvedShop.shopId ? String(resolvedShop.shopId) : resolvedShop._id?.toString() || String(shopId);
    return { shopIds: Array.from(ids), canonicalShopId };
};

export class ShopDetailService {
    async createDetail(shopId: string, ownerId: string, data: CreateShopDetailDto) {
        const shop = await shopRepository.getShopByIdOrShopId(shopId);
        if (!shop) {
            throw new HttpError(404, "Shop not found");
        }

        const shopOwnerId = shop.ownerId?.toString();
        if (!shopOwnerId || shopOwnerId !== ownerId?.toString()) {
            throw new HttpError(403, "Not authorized to add details for this shop");
        }

        const { canonicalShopId } = normalizeShopIds(shopId, shop);

        // Check if details already exist for this shop
        const existing = await shopDetailRepository.getDetailByShopId(canonicalShopId);
        if (existing) {
            throw new HttpError(400, "Shop details already exist. Use update instead.");
        }

        const payload = { ...data, shopId: canonicalShopId };
        return shopDetailRepository.createDetail(payload);
    }

    async getDetailByShopId(shopId: string) {
        const shop = await shopRepository.getShopByIdOrShopId(shopId);
        if (!shop) {
            throw new HttpError(404, "Shop not found");
        }
        const { shopIds } = normalizeShopIds(shopId, shop);
        
        // Try to find details for any of the shop IDs
        for (const id of shopIds) {
            const detail = await shopDetailRepository.getDetailByShopId(id);
            if (detail) return detail;
        }
        
        return null;
    }

    async getDetailById(shopId: string, detailId: string) {
        const shop = await shopRepository.getShopByIdOrShopId(shopId);
        if (!shop) {
            throw new HttpError(404, "Shop not found");
        }
        const { shopIds } = normalizeShopIds(shopId, shop);
        const detail = await shopDetailRepository.getDetailById(detailId);
        if (!detail || !shopIds.includes(String(detail.shopId))) {
            throw new HttpError(404, "Shop detail not found");
        }
        return detail;
    }

    async updateDetail(shopId: string, detailId: string, ownerId: string, data: UpdateShopDetailDto) {
        const shop = await shopRepository.getShopByIdOrShopId(shopId);
        if (!shop) {
            throw new HttpError(404, "Shop not found");
        }

        const shopOwnerId = shop.ownerId?.toString();
        if (!shopOwnerId || shopOwnerId !== ownerId?.toString()) {
            throw new HttpError(403, "Not authorized to update details for this shop");
        }

        const { shopIds } = normalizeShopIds(shopId, shop);
        const existing = await shopDetailRepository.getDetailById(detailId);
        if (!existing || !shopIds.includes(String(existing.shopId))) {
            throw new HttpError(404, "Shop detail not found");
        }

        const updated = await shopDetailRepository.updateDetail(detailId, data);
        return updated;
    }

    async deleteDetail(shopId: string, detailId: string, ownerId: string) {
        const shop = await shopRepository.getShopByIdOrShopId(shopId);
        if (!shop) {
            throw new HttpError(404, "Shop not found");
        }

        const shopOwnerId = shop.ownerId?.toString();
        if (!shopOwnerId || shopOwnerId !== ownerId?.toString()) {
            throw new HttpError(403, "Not authorized to delete details for this shop");
        }

        const { shopIds } = normalizeShopIds(shopId, shop);
        const existing = await shopDetailRepository.getDetailById(detailId);
        if (!existing || !shopIds.includes(String(existing.shopId))) {
            throw new HttpError(404, "Shop detail not found");
        }

        const deleted = await shopDetailRepository.deleteDetail(detailId);
        return deleted;
    }
}
