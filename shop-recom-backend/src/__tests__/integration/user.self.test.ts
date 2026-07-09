import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { RoleModel } from "../../models/role.model";

jest.setTimeout(20000);

describe("User Self Integration Tests", () => {
    const user = {
        fullName: "Self User",
        email: "selfuser1@example.com",
        phoneNumber: 9877777777,
        username: "selfuser1",
        password: "Test@1234",
        confirmPassword: "Test@1234",
        role: "user",
    };

    let userToken = "";

    beforeAll(async () => {
        const userRole = await RoleModel.findOne({ roleName: "user" });
        if (!userRole) {
            await RoleModel.create({ roleName: "user" });
        }

        await UserModel.deleteMany({ email: user.email });
        await request(app).post("/api/auth/register").send(user);

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({ email: user.email, password: user.password });
        userToken = loginResponse.body.token;
    });

    afterAll(async () => {
        await UserModel.deleteMany({ email: user.email });
    });

    describe("GET /api/user/whoami", () => {
        test("should reject request without token", async () => {
            const response = await request(app).get("/api/user/whoami");
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("message");
        });

        test("should return user profile", async () => {
            const response = await request(app)
                .get("/api/user/whoami")
                .set("Authorization", `Bearer ${userToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "User profile fetched successfully");
        });
    });
});
