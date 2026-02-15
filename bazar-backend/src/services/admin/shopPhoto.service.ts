import { HttpError } from "../../errors/http-error";
import { ShopPhotoRepository } from "../../repositories/shopPhoto.repository";
import fs from "fs";
import path from "path";

const shopPhotoRepository = new ShopPhotoRepository();

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

export class AdminShopPhotoService {
    async disablePhoto(photoId: string) {
        const existing = await shopPhotoRepository.getPhotoById(photoId);
        if (!existing) {
            throw new HttpError(404, "Shop photo not found");
        }
        const updated = await shopPhotoRepository.updatePhoto(photoId, { isActive: false });
        return updated;
    }

    async deletePhoto(photoId: string) {
        const existing = await shopPhotoRepository.getPhotoById(photoId);
        if (!existing) {
            throw new HttpError(404, "Shop photo not found");
        }
        const result = await shopPhotoRepository.deletePhoto(photoId);
        if (result) {
            await removeUploadFile(existing.photoName);
        }
        return result;
    }
}
