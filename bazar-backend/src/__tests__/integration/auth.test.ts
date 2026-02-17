import request from 'supertest';
import app from "../../app";
import { UserModel } from '../../models/user.model';

describe(
    "Auhentication Integration Tests", //name of test suite group
    () => { //what to do in test
        const loginUser = {
            fullName:"Test user",
            email: "testuser11@example.com",
            phoneNumber: 9821456764,
            username: "testuser11",
            password: "Test@1234",
            confirmPassword: "Test@1234",
        }
        const registerUser = {
            fullName:"Test user 2",
            email: "testuser22@example.com",
            phoneNumber: 9821456777,
            username: "testuser22",
            password: "Test@1234",
            confirmPassword: "Test@1234",
        }
        beforeAll(async () => {
            // Clean up test user if exists
            await UserModel.deleteOne({ email: loginUser.email });
            await UserModel.deleteOne({ email: registerUser.email });
            await request(app)
                .post("/api/auth/register")
                .send(loginUser)
        });
        afterAll(async () => {
            // Clean up test user after tests
            await UserModel.deleteOne({ email: loginUser.email });
            await UserModel.deleteOne({ email: registerUser.email });
        });

        describe(
            "POST /api/auth/register", // nested test suite/group
            () => {
                test(
                    "should register a new user", // name of individual test
                    async () => { // what to do in test
                        const response = await request(app)
                            .post("/api/auth/register")
                            .send(registerUser)
                        
                        expect(response.status).toBe(201);
                        expect(response.body).toHaveProperty(
                            "message", 
                            "Registered successfully."
                        );
                    }
                )
                test(
                    "should reject duplicate email",
                    async () => {
                        const response = await request(app)
                            .post("/api/auth/register")
                            .send({
                                ...registerUser,
                                email: loginUser.email,
                                username: "testuser33",
                                phoneNumber: 9821456788,
                            })
                        
                        expect(response.status).toBe(400);
                        expect(response.body).toHaveProperty("message");
                    }
                )
                test(
                    "should reject duplicate username",
                    async () => {
                        const response = await request(app)
                            .post("/api/auth/register")
                            .send({
                                ...registerUser,
                                email: "testuser44@example.com",
                                username: loginUser.username,
                                phoneNumber: 9821456799,
                            })
                        
                        expect(response.status).toBe(400);
                        expect(response.body).toHaveProperty("message");
                    }
                )
                test(
                    "should reject invalid email",
                    async () => {
                        const response = await request(app)
                            .post("/api/auth/register")
                            .send({
                                ...registerUser,
                                email: "invalid-email",
                                username: "testuser55",
                                phoneNumber: 9821456701,
                            })
                        
                        expect(response.status).toBe(400);
                        expect(response.body).toHaveProperty("message");
                    }
                )
                test(
                    "should reject invalid phone number",
                    async () => {
                        const response = await request(app)
                            .post("/api/auth/register")
                            .send({
                                ...registerUser,
                                email: "testuser66@example.com",
                                username: "testuser66",
                                phoneNumber: "12345",
                            })
                        
                        expect(response.status).toBe(400);
                        expect(response.body).toHaveProperty("message");
                    }
                )
            }
        )
        const testUser2 = {
            email: "testuser11@example.com",
            password: "Test@1234",
        }
        describe(
            "POST /api/auth/login", // nested test suite/group
            () => {
                test(
                    "should login a user", // name of individual test
                    async () => { // what to do in test
                        const response = await request(app)
                            .post("/api/auth/login")
                            .send(testUser2)
                        
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty(
                            "message", 
                            "Login Successful"
                        );
                    }
                )
                test(
                    "should reject invalid password",
                    async () => {
                        const response = await request(app)
                            .post("/api/auth/login")
                            .send({ email: testUser2.email, password: "Wrong@123" })
                        
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty("message");
                    }
                )
                test(
                    "should reject unknown email",
                    async () => {
                        const response = await request(app)
                            .post("/api/auth/login")
                            .send({ email: "unknown@example.com", password: "Test@1234" })
                        
                        expect(response.status).toBe(404);
                        expect(response.body).toHaveProperty("message");
                    }
                )
            }
        )
        describe(
            "GET /api/auth/whoami",
            () => {
                test(
                    "should return user profile with valid token",
                    async () => {
                        const loginResponse = await request(app)
                            .post("/api/auth/login")
                            .send(testUser2)

                        const token = loginResponse.body.token;
                        const response = await request(app)
                            .get("/api/auth/whoami")
                            .set("Authorization", `Bearer ${token}`)

                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty(
                            "message",
                            "User profile fetched successfully"
                        );
                    }
                )
                test(
                    "should reject request without token",
                    async () => {
                        const response = await request(app)
                            .get("/api/auth/whoami")

                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty("message");
                    }
                )
            }
        )
    }
)