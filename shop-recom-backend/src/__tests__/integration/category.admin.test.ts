import request from "supertest";
import mongoose from "mongoose";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { RoleModel } from "../../models/role.model";
import { CategoryModel } from "../../models/category.model";

jest.setTimeout(20000);

describe("Category Admin Integration Tests", () => {
    const adminUser = {
        fullName: "Category Admin",
        email: "categoryadmin1@example.com",
        phoneNumber: 9811110001,
        username: "categoryadmin1",
        password: "Test@1234",
        confirmPassword: "Test@1234",
        role: "admin",
    };

    const normalUser = {
        fullName: "Category User",
        email: "categoryuser1@example.com",
        phoneNumber: 9811110002,
        username: "categoryuser1",
        password: "Test@1234",
        confirmPassword: "Test@1234",
        role: "user",
    };

    const seededCategoryName = "Existing Category";
    const duplicateCategoryName = "Duplicate Category";
    const createdCategoryName = "Created Category";
    const updatedCategoryName = "Updated Category";

    let adminToken = "";
    let userToken = "";
    let seededCategoryId = "";
    let duplicateCategoryId = "";
    let createdCategoryId = "";

    beforeAll(async () => {
        const userRole = await RoleModel.findOne({ roleName: "user" });
        if (!userRole) {
            await RoleModel.create({ roleName: "user" });
        }
        const adminRole = await RoleModel.findOne({ roleName: "admin" });
        if (!adminRole) {
            await RoleModel.create({ roleName: "admin" });
        }

        await UserModel.deleteMany({ email: { $in: [adminUser.email, normalUser.email] } });
        await CategoryModel.deleteMany({
            categoryName: {
                $in: [
                    seededCategoryName,
                    duplicateCategoryName,
                    createdCategoryName,
                    updatedCategoryName,
                ],
            },
        });

        await request(app).post("/api/auth/register").send(adminUser);
        await request(app).post("/api/auth/register").send(normalUser);

        const adminLogin = await request(app)
            .post("/api/auth/login")
            .send({ email: adminUser.email, password: adminUser.password });
        adminToken = adminLogin.body.token;

        const userLogin = await request(app)
            .post("/api/auth/login")
            .send({ email: normalUser.email, password: normalUser.password });
        userToken = userLogin.body.token;

        const seededCategory = await CategoryModel.create({ categoryName: seededCategoryName });
        seededCategoryId = seededCategory._id.toString();

        const duplicateCategory = await CategoryModel.create({ categoryName: duplicateCategoryName });
        duplicateCategoryId = duplicateCategory._id.toString();
    });

    afterAll(async () => {
        await UserModel.deleteMany({ email: { $in: [adminUser.email, normalUser.email] } });
        await CategoryModel.deleteMany({
            categoryName: {
                $in: [
                    seededCategoryName,
                    duplicateCategoryName,
                    createdCategoryName,
                    updatedCategoryName,
                ],
            },
        });
    });

    describe("GET /api/categories", () => {
        test("should return categories for public request", async () => {
            const response = await request(app).get("/api/categories");
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "Categories retrieved successfully.");
        });
    });

    describe("POST /api/categories", () => {
        test("should reject request without token", async () => {
            const response = await request(app)
                .post("/api/categories")
                .send({ categoryName: "No Auth Category" });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("message");
        });

        test("should reject non-admin token", async () => {
            const response = await request(app)
                .post("/api/categories")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ categoryName: "Non Admin Category" });
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty("message");
        });

        test("should create a category", async () => {
            const response = await request(app)
                .post("/api/categories")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ categoryName: createdCategoryName });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("message", "Category created successfully.");
            createdCategoryId = response.body?.data?._id || "";
        });

        test("should reject duplicate category name", async () => {
            const response = await request(app)
                .post("/api/categories")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ categoryName: seededCategoryName });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
        });

        test("should reject invalid payload", async () => {
            const response = await request(app)
                .post("/api/categories")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ categoryName: "A" });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
        });
    });

    describe("GET /api/categories/:id", () => {
        test("should return category by id", async () => {
            const response = await request(app)
                .get(`/api/categories/${seededCategoryId}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "Category retrieved successfully.");
        });

        test("should return 404 for missing category", async () => {
            const response = await request(app)
                .get(`/api/categories/${new mongoose.Types.ObjectId().toString()}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("message");
        });
    });

    describe("PUT /api/categories/:id", () => {
        test("should reject request without token", async () => {
            const response = await request(app)
                .put(`/api/categories/${seededCategoryId}`)
                .send({ categoryName: updatedCategoryName });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("message");
        });

        test("should reject non-admin token", async () => {
            const response = await request(app)
                .put(`/api/categories/${seededCategoryId}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({ categoryName: updatedCategoryName });
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty("message");
        });

        test("should update category", async () => {
            const response = await request(app)
                .put(`/api/categories/${seededCategoryId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ categoryName: updatedCategoryName });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "Category updated successfully.");
        });

        test("should reject duplicate category name", async () => {
            const response = await request(app)
                .put(`/api/categories/${duplicateCategoryId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ categoryName: "Updated Category" });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
        });
    });

    describe("DELETE /api/categories/:id", () => {
        test("should reject request without token", async () => {
            const response = await request(app)
                .delete(`/api/categories/${seededCategoryId}`);
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("message");
        });

        test("should reject non-admin token", async () => {
            const response = await request(app)
                .delete(`/api/categories/${seededCategoryId}`)
                .set("Authorization", `Bearer ${userToken}`);
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty("message");
        });

        test("should delete a category", async () => {
            const response = await request(app)
                .delete(`/api/categories/${createdCategoryId}`)
                .set("Authorization", `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "Category deleted successfully.");
        });

        test("should return 404 for missing category", async () => {
            const response = await request(app)
                .delete(`/api/categories/${new mongoose.Types.ObjectId().toString()}`)
                .set("Authorization", `Bearer ${adminToken}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("message");
        });
    });
});
