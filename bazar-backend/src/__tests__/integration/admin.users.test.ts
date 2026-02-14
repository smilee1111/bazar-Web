import request from "supertest";
import mongoose from "mongoose";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { RoleModel } from "../../models/role.model";

jest.setTimeout(20000);

describe("Admin Users Integration Tests", () => {
    const adminUser = {
        fullName: "Admin Tester",
        email: "adminuser1@example.com",
        phoneNumber: 9811111111,
        username: "adminuser1",
        password: "Test@1234",
        confirmPassword: "Test@1234",
        role: "admin",
    };

    const normalUser = {
        fullName: "Normal User",
        email: "normaluser1@example.com",
        phoneNumber: 9822222222,
        username: "normaluser1",
        password: "Test@1234",
        confirmPassword: "Test@1234",
        role: "user",
    };

    let adminToken = "";
    let managedUserId = "";
    let userToken = "";

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

        await request(app).post("/api/auth/register").send(adminUser);
        await request(app).post("/api/auth/register").send(normalUser);

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({ email: adminUser.email, password: adminUser.password });
        adminToken = loginResponse.body.token;

        const userLoginResponse = await request(app)
            .post("/api/auth/login")
            .send({ email: normalUser.email, password: normalUser.password });
        userToken = userLoginResponse.body.token;

        const managedUser = await UserModel.findOne({ email: normalUser.email });
        managedUserId = managedUser?._id.toString() || "";
    });

    afterAll(async () => {
        await UserModel.deleteMany({ 
            email: { 
                $in: [
                    adminUser.email, 
                    normalUser.email, 
                    "manageduser1@example.com", 
                    "deleteuser1@example.com"
                ] 
            } 
        });
    });

    describe("GET /api/admin/users", () => {
        test("should reject request without token", async () => {
            const response = await request(app).get("/api/admin/users");
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("message");
        });

        test("should reject non-admin token", async () => {
            const response = await request(app)
                .get("/api/admin/users")
                .set("Authorization", `Bearer ${userToken}`);
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty("message");
        });

        test("should return users for admin", async () => {
            const response = await request(app)
                .get("/api/admin/users")
                .set("Authorization", `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "Users retrieved successfully.");
        });
    });

    describe("POST /api/admin/users/register-admin", () => {
        test("should create a user", async () => {
            await UserModel.deleteMany({ email: "manageduser1@example.com" });
            
            const response = await request(app)
                .post("/api/admin/users/register-admin")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    fullName: "Managed User",
                    email: "manageduser1@example.com",
                    phoneNumber: 9833333333,
                    username: "manageduser1",
                    password: "Test@1234",
                    confirmPassword: "Test@1234",
                    role: "user",
                });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("message", "User Created Successfully.");
        });

        test("should reject duplicate email", async () => {
            const response = await request(app)
                .post("/api/admin/users/register-admin")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    fullName: "Dup User",
                    email: normalUser.email,
                    phoneNumber: 9844444444,
                    username: "dupuser1",
                    password: "Test@1234",
                    confirmPassword: "Test@1234",
                    role: "user",
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
        });

        test("should reject invalid role", async () => {
            const response = await request(app)
                .post("/api/admin/users/register-admin")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    fullName: "Invalid Role",
                    email: "invalidrole1@example.com",
                    phoneNumber: 9866666666,
                    username: "invalidrole1",
                    password: "Test@1234",
                    confirmPassword: "Test@1234",
                    role: "ghost",
                });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
        });
    });

    describe("GET /api/admin/users/:id", () => {
        test("should get user by id", async () => {
            const response = await request(app)
                .get(`/api/admin/users/${managedUserId}`)
                .set("Authorization", `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "User profile fetched successfully");
        });

        test("should return 404 for missing user", async () => {
            const response = await request(app)
                .get(`/api/admin/users/${new mongoose.Types.ObjectId().toString()}`)
                .set("Authorization", `Bearer ${adminToken}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("message");
        });
    });

    describe("PUT /api/admin/users/:id", () => {
        test("should update user profile", async () => {
            const response = await request(app)
                .put(`/api/admin/users/${managedUserId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ fullName: "Updated User" });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "User updated successfully");
        });

        test("should reject duplicate email", async () => {
            const response = await request(app)
                .put(`/api/admin/users/${managedUserId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ email: adminUser.email });
            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty("message");
        });

        test("should reject update without token", async () => {
            const response = await request(app)
                .put(`/api/admin/users/${managedUserId}`)
                .send({ fullName: "No Token" });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("message");
        });
    });

    describe("DELETE /api/admin/users/:id", () => {
        test("should delete a user", async () => {
            const created = await request(app)
                .post("/api/admin/users/register-admin")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    fullName: "Delete User",
                    email: "deleteuser1@example.com",
                    phoneNumber: 9855555555,
                    username: "deleteuser1",
                    password: "Test@1234",
                    confirmPassword: "Test@1234",
                    role: "user",
                });

            const userId = created.body?.data?._id;
            const response = await request(app)
                .delete(`/api/admin/users/${userId}`)
                .set("Authorization", `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "User deleted successfully");
        });

        test("should return 404 for missing user", async () => {
            const response = await request(app)
                .delete(`/api/admin/users/${new mongoose.Types.ObjectId().toString()}`)
                .set("Authorization", `Bearer ${adminToken}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("message");
        });
    });
});
