import request from "supertest";
import mongoose from "mongoose";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { RoleModel } from "../../models/role.model";
import { CategoryModel } from "../../models/category.model";
import { ShopModel } from "../../models/shop.model";
import { UserBehaviourModel } from "../../interactions_userbehaviour/models/userBehaviour.model";
import { ShopReviewModel } from "../../models/shopReview.model";

jest.setTimeout(30000);

describe("Recommendation Evaluation Integration Tests", () => {
    const adminPayload = {
        fullName: "Eval Admin",
        email: "evaladmin1@example.com",
        phoneNumber: 9811001100,
        username: "evaladmin1",
        password: "Test@1234",
        confirmPassword: "Test@1234",
        role: "admin",
    };

    const userPayload = {
        fullName: "Eval User",
        email: "evaluser1@example.com",
        phoneNumber: 9811001122,
        username: "evaluser1",
        password: "Test@1234",
        confirmPassword: "Test@1234",
        role: "user",
    };

    let adminToken = "";
    let userToken = "";
    let userId = "";
    let category1Id = "";
    let shop1Id = "";
    let shop2Id = "";

    beforeAll(async () => {
        // Ensure roles exist
        const adminRole = await RoleModel.findOne({ roleName: "admin" });
        if (!adminRole) {
            await RoleModel.create({ roleName: "admin", roleId: "role_admin_001", status: "active" });
        }
        const userRole = await RoleModel.findOne({ roleName: "user" });
        if (!userRole) {
            await RoleModel.create({ roleName: "user", roleId: "role_user_001", status: "active" });
        }

        // Clean up any leftovers
        await UserModel.deleteMany({ email: { $in: [adminPayload.email, userPayload.email] } });
        await CategoryModel.deleteMany({ categoryName: "Eval Category" });

        // Register and login admin
        await request(app).post("/api/auth/register").send(adminPayload);
        const adminLogin = await request(app)
            .post("/api/auth/login")
            .send({ email: adminPayload.email, password: adminPayload.password });
        adminToken = adminLogin.body.token;

        // Register and login user
        await request(app).post("/api/auth/register").send(userPayload);
        const userLogin = await request(app)
            .post("/api/auth/login")
            .send({ email: userPayload.email, password: userPayload.password });
        userToken = userLogin.body.token;

        const loggedUser = await UserModel.findOne({ email: userPayload.email });
        userId = loggedUser!._id.toString();

        // Create category
        const cat = await CategoryModel.create({ categoryName: "Eval Category" });
        category1Id = cat.categoryId || cat._id.toString();

        // Create shops
        await ShopModel.deleteMany({ shopName: { $in: ["Eval Shop 1", "Eval Shop 2"] } });

        const shop1 = new ShopModel({
            ownerId: userId,
            shopName: "Eval Shop 1",
            shopAddress: "Kathmandu Eval 1",
            shopContact: "9800000100",
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
            shopName: "Eval Shop 2",
            shopAddress: "Kathmandu Eval 2",
            shopContact: "9800000200",
            categoryId: category1Id,
            location: {
                type: "Point",
                coordinates: [85.3250, 27.7182]
            },
            isActive: true
        } as any);
        await shop2.save();
        shop2Id = (shop2 as any)._id.toString();

        // Seed behavior logs chronologically (we need at least 5 logs overall to meet default minLogsCount of 5)
        await UserBehaviourModel.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
        
        // Train logs (first 70% of 6 logs = 4 logs)
        const baseTime = Date.now() - 1000 * 60 * 60; // 1 hr ago
        await UserBehaviourModel.create([
            {
                userId: new mongoose.Types.ObjectId(userId),
                shopId: new mongoose.Types.ObjectId(shop1Id),
                eventType: "view",
                timestamp: new Date(baseTime)
            },
            {
                userId: new mongoose.Types.ObjectId(userId),
                shopId: new mongoose.Types.ObjectId(shop1Id),
                eventType: "view",
                timestamp: new Date(baseTime + 1000)
            },
            {
                userId: new mongoose.Types.ObjectId(userId),
                shopId: new mongoose.Types.ObjectId(shop1Id),
                eventType: "view",
                timestamp: new Date(baseTime + 2000)
            },
            {
                userId: new mongoose.Types.ObjectId(userId),
                shopId: new mongoose.Types.ObjectId(shop1Id),
                eventType: "view",
                timestamp: new Date(baseTime + 3000)
            },
            // Test logs (remaining 30% = 2 logs)
            // One view and one favorite (ground truth relevant shop = shop2Id)
            {
                userId: new mongoose.Types.ObjectId(userId),
                shopId: new mongoose.Types.ObjectId(shop2Id),
                eventType: "view",
                timestamp: new Date(baseTime + 4000)
            },
            {
                userId: new mongoose.Types.ObjectId(userId),
                shopId: new mongoose.Types.ObjectId(shop2Id),
                eventType: "favorite",
                timestamp: new Date(baseTime + 5000)
            }
        ]);
    });

    afterAll(async () => {
        // Clean up
        await UserModel.deleteMany({ email: { $in: [adminPayload.email, userPayload.email] } });
        await CategoryModel.deleteMany({ categoryName: "Eval Category" });
        await ShopModel.deleteMany({ _id: { $in: [shop1Id, shop2Id] } });
        await UserBehaviourModel.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
        await mongoose.connection.close();
    });

    describe("GET /api/admin/evaluation", () => {
        test("should reject request without token", async () => {
            const response = await request(app).get("/api/admin/evaluation?lat=27.7172&lng=85.3240");
            expect(response.status).toBe(401);
        });

        test("should reject request with non-admin token", async () => {
            const response = await request(app)
                .get("/api/admin/evaluation?lat=27.7172&lng=85.3240")
                .set("Authorization", `Bearer ${userToken}`);
            expect(response.status).toBe(403);
            expect(response.body.message).toContain("Forbidden Admins only");
        });

        test("should return evaluation statistics for admin", async () => {
            const response = await request(app)
                .get("/api/admin/evaluation?lat=27.7172&lng=85.3240&minLogsCount=5")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body.data).toHaveProperty("totalUsersEvaluated");
            expect(response.body.data).toHaveProperty("personalized");
            expect(response.body.data).toHaveProperty("baseline");
            
            const data = response.body.data;
            expect(data.totalUsersEvaluated).toBeGreaterThanOrEqual(1);
            expect(data.personalized).toHaveProperty("precisionAt5");
            expect(data.personalized).toHaveProperty("recallAt5");
            expect(data.baseline).toHaveProperty("precisionAt5");
            expect(data.baseline).toHaveProperty("recallAt5");
        });
    });
});
