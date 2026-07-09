import request from "supertest";
import mongoose from "mongoose";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { RoleModel } from "../../models/role.model";
import { CategoryModel } from "../../models/category.model";
import { ShopModel } from "../../models/shop.model";
import { UserBehaviourModel } from "../../interactions_userbehaviour/models/userBehaviour.model";
import { FavouriteModel } from "../../models/favourite.model";
import { ShopReviewModel } from "../../models/shopReview.model";

jest.setTimeout(30000);

describe("Recommendation Integration Tests", () => {
    const userPayload = {
        fullName: "Recom User",
        email: "recomuser1@example.com",
        phoneNumber: 9811223344,
        username: "recomuser1",
        password: "Test@1234",
        confirmPassword: "Test@1234",
        role: "user",
    };

    let userToken = "";
    let userId = "";
    let category1Id = "";
    let category2Id = "";
    let shop1Id = "";
    let shop2Id = "";
    let shop3Id = "";

    beforeAll(async () => {
        // Ensure roles exist
        const userRole = await RoleModel.findOne({ roleName: "user" });
        if (!userRole) {
            await RoleModel.create({ roleName: "user" });
        }

        // Clean up any leftovers
        await UserModel.deleteMany({ email: userPayload.email });
        await CategoryModel.deleteMany({ categoryName: { $in: ["Recom Category 1", "Recom Category 2"] } });

        // Register and login
        await request(app).post("/api/auth/register").send(userPayload);
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({ email: userPayload.email, password: userPayload.password });
        userToken = loginResponse.body.token;

        const loggedUser = await UserModel.findOne({ email: userPayload.email });
        userId = loggedUser!._id.toString();

        // Create categories
        const cat1 = await CategoryModel.create({ categoryName: "Recom Category 1" });
        category1Id = cat1.categoryId || cat1._id.toString();

        const cat2 = await CategoryModel.create({ categoryName: "Recom Category 2" });
        category2Id = cat2.categoryId || cat2._id.toString();

        // Clean up shops
        await ShopModel.deleteMany({ shopName: { $in: ["Recom Shop 1", "Recom Shop 2", "Recom Shop 3"] } });

        // Create nearby shops: Shop 1 is in Cat 1, Shop 2 is in Cat 2, Shop 3 is in Cat 1
        // Kathmandu coords: [85.3240, 27.7172] (lng, lat)
        const shop1 = new ShopModel({
            ownerId: userId,
            shopName: "Recom Shop 1",
            shopAddress: "Kathmandu Near 1",
            shopContact: "9800000010",
            categoryId: category1Id,
            location: {
                type: "Point",
                coordinates: [85.3240, 27.7172]
            },
            isActive: true
        } as any);
        await shop1.save();
        shop1Id = (shop1 as any)._id.toString();

        const shop2 = new ShopModel({
            ownerId: userId,
            shopName: "Recom Shop 2",
            shopAddress: "Kathmandu Near 2",
            shopContact: "9800000020",
            categoryId: category2Id,
            location: {
                type: "Point",
                coordinates: [85.3250, 27.7182]
            },
            isActive: true
        } as any);
        await shop2.save();
        shop2Id = (shop2 as any)._id.toString();

        const shop3 = new ShopModel({
            ownerId: userId,
            shopName: "Recom Shop 3",
            shopAddress: "Kathmandu Near 3",
            shopContact: "9800000030",
            categoryId: category1Id,
            location: {
                type: "Point",
                coordinates: [85.3260, 27.7192]
            },
            isActive: true
        } as any);
        await shop3.save();
        shop3Id = (shop3 as any)._id.toString();

        // Seed reviews for Shop 1 & Shop 2 (to set popularity scores)
        await ShopReviewModel.deleteMany({ shopId: { $in: [shop1Id, shop2Id, shop3Id, (shop1 as any).shopId, (shop2 as any).shopId, (shop3 as any).shopId] } });
        // Shop 1: 5 star review
        await ShopReviewModel.create({
            reviewName: "Great Shop 1",
            shopId: (shop1 as any).shopId || shop1Id,
            reviewedBy: userId,
            starNum: 5,
            isActive: true
        });
        // Shop 2: 4 star review
        await ShopReviewModel.create({
            reviewName: "Good Shop 2",
            shopId: (shop2 as any).shopId || shop2Id,
            reviewedBy: userId,
            starNum: 4,
            isActive: true
        });

        // Seed behavior logs: user viewed Shop 1 and Shop 3 (which are in Category 1)
        await UserBehaviourModel.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
        await UserBehaviourModel.create([
            {
                userId: new mongoose.Types.ObjectId(userId),
                shopId: new mongoose.Types.ObjectId(shop1Id),
                eventType: "view",
                timestamp: new Date()
            },
            {
                userId: new mongoose.Types.ObjectId(userId),
                shopId: new mongoose.Types.ObjectId(shop3Id),
                eventType: "view",
                timestamp: new Date()
            }
        ]);
    });

    afterAll(async () => {
        // Clean up everything
        await UserModel.deleteMany({ email: userPayload.email });
        await CategoryModel.deleteMany({ categoryName: { $in: ["Recom Category 1", "Recom Category 2"] } });
        await ShopModel.deleteMany({ _id: { $in: [shop1Id, shop2Id, shop3Id] } });
        await ShopReviewModel.deleteMany({ reviewedBy: userId });
        await UserBehaviourModel.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
        await FavouriteModel.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
        await mongoose.connection.close();
    });

    describe("GET /api/recommendations", () => {
        test("should reject request without token", async () => {
            const response = await request(app).get("/api/recommendations?lat=27.7172&lng=85.3240");
            expect(response.status).toBe(401);
        });

        test("should reject request with invalid coordinates", async () => {
            const response = await request(app)
                .get("/api/recommendations?lat=invalid&lng=85.3240")
                .set("Authorization", `Bearer ${userToken}`);
            expect(response.status).toBe(400);
            expect(response.body.message).toContain("Validation error");
        });

        test("should return recommendations and exclude already favorited shops", async () => {
            // Add Shop 1 to favourites
            const shop1Doc = await ShopModel.findById(shop1Id);
            await FavouriteModel.create({
                userId: new mongoose.Types.ObjectId(userId),
                shopId: shop1Doc!.shopId || shop1Id,
                isReviewed: false
            });

            const response = await request(app)
                .get("/api/recommendations?lat=27.7172&lng=85.3240&k=10")
                .set("Authorization", `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body.data).toBeInstanceOf(Array);

            const recs = response.body.data;
            // Shop 1 should be excluded because it is in favorites
            const shopIdsInRecs = recs.map((r: any) => r.shop._id.toString());
            expect(shopIdsInRecs).not.toContain(shop1Id);

            // Remaining shops should be Shop 2 and Shop 3
            expect(shopIdsInRecs).toContain(shop2Id);
            expect(shopIdsInRecs).toContain(shop3Id);

            // Shop 3 should rank higher than Shop 2 because the user's interest profile has weight only on Category 1
            expect(recs[0].shop._id.toString()).toBe(shop3Id);
        });
    });
});
