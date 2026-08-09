import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { RoleModel } from "../../models/role.model";

jest.setTimeout(20000);

describe("Role Admin Integration Tests", () => {
    const adminUser = {
        fullName: "Role Admin",
        email: "roleadmin1@example.com",
        phoneNumber: 9822200001,
        username: "roleadmin1",
        password: "Test@1234",
        confirmPassword: "Test@1234",
        role: "admin",
    };

    const normalUser = {
        fullName: "Role User",
        email: "roleuser1@example.com",
        phoneNumber: 9822200002,
        username: "roleuser1",
        password: "Test@1234",
        confirmPassword: "Test@1234",
        role: "user",
    };

    const createdRoleName = "testrole1";

    let adminToken = "";
    let userToken = "";
    let createdRoleId = "";

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
        await RoleModel.deleteMany({ roleName: createdRoleName });

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
    });

    afterAll(async () => {
        await UserModel.deleteMany({ email: { $in: [adminUser.email, normalUser.email] } });
        await RoleModel.deleteMany({ roleName: createdRoleName });
    });

    describe("GET /api/roles", () => {
        test("should return public roles without admin", async () => {
            const response = await request(app).get("/api/roles");
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "Roles retrieved successfully.");
            const roleNames = (response.body?.data || []).map((role: any) => role.roleName);
            expect(roleNames).not.toContain("admin");
        });

        test("should return all roles for admin token", async () => {
            const response = await request(app)
                .get("/api/roles")
                .set("Authorization", `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "Roles retrieved successfully.");
            const roleNames = (response.body?.data || []).map((role: any) => role.roleName);
            expect(roleNames).toContain("admin");
        });
    });

    describe("POST /api/roles", () => {
        test("should reject request without token", async () => {
            const response = await request(app)
                .post("/api/roles")
                .send({ roleName: "testrole1" });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("message");
        });

        test("should reject non-admin token", async () => {
            const response = await request(app)
                .post("/api/roles")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ roleName: "testrole1" });
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty("message");
        });

        test("should create a role", async () => {
            const response = await request(app)
                .post("/api/roles")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ roleName: createdRoleName });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("message", "Role created successfully.");
            createdRoleId = response.body?.data?._id || "";
        });

        test("should reject duplicate role name", async () => {
            const response = await request(app)
                .post("/api/roles")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ roleName: createdRoleName });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
        });
    });

    describe("GET /api/roles/:id", () => {
        test("should return role by id", async () => {
            const response = await request(app)
                .get(`/api/roles/${createdRoleId}`)
                .set("Authorization", `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "Role retrieved successfully.");
        });
    });

    describe("PUT /api/roles/:id", () => {
        test("should update role", async () => {
            const response = await request(app)
                .put(`/api/roles/${createdRoleId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ status: "inactive" });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "Role updated successfully.");
        });
    });

    describe("DELETE /api/roles/:id", () => {
        test("should delete role", async () => {
            const response = await request(app)
                .delete(`/api/roles/${createdRoleId}`)
                .set("Authorization", `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "Role deleted successfully.");
        });
    });
});
