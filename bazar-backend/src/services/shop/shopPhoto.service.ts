import { CreateShopPhotoDto, UpdateShopPhotoDto } from "../../dtos/shopPhoto.dto";
import { HttpError } from "../../errors/http-error";
import { ShopRepository } from "../../repositories/shop.repository";
import { ShopPhotoRepository } from "../../repositories/shopPhoto.repository";
import fs from "fs";
import path from "path";

const shopRepository = new ShopRepository();
const shopPhotoRepository = new ShopPhotoRepository();

const normalizeShopIds = (shopId: string, resolvedShop: { shopId?: string; _id?: { toString(): string } }) => {
    const ids = new Set<string>();
    if (shopId) ids.add(String(shopId));
    if (resolvedShop.shopId) ids.add(String(resolvedShop.shopId));
    if (resolvedShop._id) ids.add(resolvedShop._id.toString());
    const canonicalShopId = resolvedShop.shopId ? String(resolvedShop.shopId) : resolvedShop._id?.toString() || String(shopId);
    return { shopIds: Array.from(ids), canonicalShopId };
};

const uploadsDir = path.join(__dirname, "../../../uploads");

const removeUploadFile = async (filePath?: string | null) => {
    if (!filePath || typeof filePath !== "string") return;
    if (!filePath.startsWith("/uploads/")) return;
    const fileName = filePath.replace("/uploads/", "");
    const absolutePath = path.join(uploadsDir, fileName);
    try {
        await fs.promises.unlink(absolutePath);
    } catch (error) {
        // Ignore missing files or IO errors during cleanup
    }
};

export class ShopPhotoService {
    async createPhoto(shopId: string, ownerId: string, data: CreateShopPhotoDto) {
        const shop = await shopRepository.getShopByIdOrShopId(shopId);
        if (!shop) {
            throw new HttpError(404, "Shop not found");
        }

        const shopOwnerId = shop.ownerId?.toString();
        if (!shopOwnerId || shopOwnerId !== ownerId?.toString()) {
            throw new HttpError(403, "Not authorized to add photos for this shop");
        }

        const { canonicalShopId } = normalizeShopIds(shopId, shop);
        const payload = { ...data, shopId: canonicalShopId };
        return shopPhotoRepository.createPhoto(payload);
    }

    async getPhotosByShopId(shopId: string) {
        const shop = await shopRepository.getShopByIdOrShopId(shopId);
        if (!shop) {
            throw new HttpError(404, "Shop not found");
        }
        const { shopIds } = normalizeShopIds(shopId, shop);
        return shopPhotoRepository.getPhotosByShopIds(shopIds);
    }

    async getPhotoById(shopId: string, photoId: string) {
        const shop = await shopRepository.getShopByIdOrShopId(shopId);
        if (!shop) {
            throw new HttpError(404, "Shop not found");
        }
        const { shopIds } = normalizeShopIds(shopId, shop);
        const photo = await shopPhotoRepository.getPhotoById(photoId);
        if (!photo || !shopIds.includes(String(photo.shopId)) || photo.isActive === false) {
            throw new HttpError(404, "Shop photo not found");
        }
        return photo;
    }

    async updatePhoto(shopId: string, photoId: string, ownerId: string, data: UpdateShopPhotoDto) {
        const shop = await shopRepository.getShopByIdOrShopId(shopId);
        if (!shop) {
            throw new HttpError(404, "Shop not found");
        }

        const shopOwnerId = shop.ownerId?.toString();
        if (!shopOwnerId || shopOwnerId !== ownerId?.toString()) {
            throw new HttpError(403, "Not authorized to update photos for this shop");
        }

        const { shopIds } = normalizeShopIds(shopId, shop);
        const existing = await shopPhotoRepository.getPhotoById(photoId);
        if (!existing || !shopIds.includes(String(existing.shopId))) {
            throw new HttpError(404, "Shop photo not found");
        }

        const oldPhotoPath = existing.photoName;
        const updated = await shopPhotoRepository.updatePhoto(photoId, data);
        if (updated && data.photoName && data.photoName !== oldPhotoPath) {
            await removeUploadFile(oldPhotoPath);
        }
        return updated;
    }

    async deletePhoto(shopId: string, photoId: string, ownerId: string) {
        const shop = await shopRepository.getShopByIdOrShopId(shopId);
        if (!shop) {
            throw new HttpError(404, "Shop not found");
        }

        const shopOwnerId = shop.ownerId?.toString();
        if (!shopOwnerId || shopOwnerId !== ownerId?.toString()) {
            throw new HttpError(403, "Not authorized to delete photos for this shop");
        }

        const { shopIds } = normalizeShopIds(shopId, shop);
        const existing = await shopPhotoRepository.getPhotoById(photoId);
        if (!existing || !shopIds.includes(String(existing.shopId))) {
            throw new HttpError(404, "Shop photo not found");
        }

        const deleted = await shopPhotoRepository.deletePhoto(photoId);
        if (deleted) {
            await removeUploadFile(existing.photoName);
        }
        return deleted;
    }
}
