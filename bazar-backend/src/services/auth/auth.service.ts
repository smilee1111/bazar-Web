import { UserRepository } from "../../repositories/user.repository";
import { RoleRepository } from "../../repositories/role.repository";
import { PasswordResetRepository } from "../../repositories/passwordReset.repository";
import { CreateUserDto, LoginUserDto, UpdateUserDto } from "../../dtos/user.dto";
import { RequestPasswordResetDto } from "../../dtos/passwordReset.dto";
import bcryptjs from "bcryptjs";
import { HttpError } from "../../errors/http-error";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../../config";
import { sendEmail } from "../../config/email";
import crypto from 'crypto';
const CLIENT_URL = process.env.CLIENT_URL as string;

let userRepository = new UserRepository();
let roleRepository = new RoleRepository();
let passwordResetRepository = new PasswordResetRepository();

// Utility functions
const generateOtp = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const hashOtp = (otp: string): string => {
    return crypto.createHash('sha256').update(otp).digest('hex');
};

const generateResetToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

const hashToken = (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

export class AuthService {
    async registerUser(data: CreateUserDto) {

        //register a user, check constraints and hash the password

        //check is email is already registered
        const emailExists = await userRepository.getUserByEmail(data.email);
        if (emailExists) {
            throw new HttpError(400, " Email already registered.");
        }
        const usernameExists = await userRepository.getUserByUsername(data.username);
        if (usernameExists) {
            throw new HttpError(400, "Username already registered.");
        }

        // Find the role by roleName (either 'user' or 'seller')
        const role = await roleRepository.getRoleByRoleName(data.role);
        if (!role) {
            throw new HttpError(400, "Invalid role selected.");
        }

        //hash the password before saving to database
        const hashedPassword = await bcryptjs.hash(data.password, 15);

        //create the user with roleId
        const newUser = await userRepository.createUser({
            fullName: data.fullName,
            email: data.email,
            phoneNumber: data.phoneNumber,
            username: data.username,
            password: hashedPassword,
            profilePic: data.profilePic,
            roleId: role._id
        });
        return newUser;
    }

    async loginUser(data: LoginUserDto) {

        //check if the user with that email exists
        const user = await userRepository.getUserByEmail(data.email);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        //check for the validity of the password 
        const validPassword = await await bcryptjs.compare(data.password, user.password);
        if (!validPassword) {
            throw new HttpError(401, "Invalid credentials");
        }

        // fetch populated user so role details are included for clients
        const userWithRole = await userRepository.getUserById(user._id.toString());
        if (!userWithRole) {
            throw new HttpError(404, "User not found");
        }

        //generate the JWT token 
        const payload = {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.roleId
        }//data to be stored in token 

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
        return { token, user: userWithRole }
    }

    async getUserById(userId: string) {
        if (!userId) {
            throw new HttpError(400, "User ID is required");
        }
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        return user;
    }

    async updateUser(userId: string, data: UpdateUserDto) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        if (user.email !== data.email) {
            const emailExists = await userRepository.getUserByEmail(data.email!);
            if (emailExists) {
                throw new HttpError(409, "Email already exists");
            }
        }
        if (user.username !== data.username) {
            const usernameExists = await userRepository.getUserByUsername(data.username!);
            if (usernameExists) {
                throw new HttpError(409, "Username already exists");
            }
        }
        if (data.password) {
            const hashedPassword = await bcryptjs.hash(data.password, 10);
            data.password = hashedPassword;
        }
        const updatedUser = await userRepository.updateUser(userId, data);
        return updatedUser;
    }

    async sendResetPasswordEmail(email?: string, clientType: string = 'web') {
        if (!email) {
            throw new HttpError(400, "Email is required");
        }
        const user = await userRepository.getUserByEmail(email);
        if (!user) {
            // Don't reveal if email exists or not (security best practice)
            return { message: "If the email is registered, a reset link/OTP has been sent." };
        }

        // Delete any previous reset requests for this email
        await passwordResetRepository.deleteByEmail(email);

        if (clientType === 'mobile') {
            // OTP-based reset for mobile
            const otp = generateOtp();
            const otpHash = hashOtp(otp);
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

            await passwordResetRepository.createPasswordReset({
                userId: user._id,
                email: user.email,
                type: 'otp',
                otpHash,
                expiresAt,
            });

            const html = `
                <h3>Password Reset OTP</h3>
                <p>Your OTP for password reset is: <strong>${otp}</strong></p>
                <p>This OTP will expire in 15 minutes.</p>
                <p>Do not share this OTP with anyone.</p>
            `;
            try {
                await sendEmail(user.email, "Password Reset OTP", html);
            } catch (err) {
                console.error("Failed to send email. OTP is:", otp);
                console.error(err);
            }
        } else {
            // Link-based reset for web
            const token = generateResetToken();
            const tokenHash = hashToken(token);
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

            await passwordResetRepository.createPasswordReset({
                userId: user._id,
                email: user.email,
                type: 'link',
                tokenHash,
                expiresAt,
            });

            const resetLink = `${CLIENT_URL}/reset-password?token=${token}`;
            console.log("\n\n--- PASSWORD RESET LINK (DEV MODE) ---");
            console.log(resetLink);
            console.log("----------------------------------------\n\n");
            
            const html = `
                <h3>Password Reset Request</h3>
                <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `;
            try {
                await sendEmail(user.email, "Password Reset Link", html);
            } catch (err) {
                console.error("Failed to send email, but reset link was generated above.");
            }
        }

        return { message: "If the email is registered, a reset link/OTP has been sent." };
    }

    async resetPassword(token?: string, newPassword?: string) {
        try {
            if (!token || !newPassword) {
                throw new HttpError(400, "Token and new password are required");
            }

            const tokenHash = hashToken(token);
            const resetRecord = await passwordResetRepository.findByToken(tokenHash);

            if (!resetRecord) {
                throw new HttpError(400, "Invalid or expired token");
            }

            if (resetRecord.used) {
                throw new HttpError(400, "This reset token has already been used");
            }

            const user = await userRepository.getUserById(resetRecord.userId.toString());
            if (!user) {
                throw new HttpError(404, "User not found");
            }

            const hashedPassword = await bcryptjs.hash(newPassword, 10);
            await userRepository.updateUser(user._id.toString(), { password: hashedPassword });
            await passwordResetRepository.markAsUsed(resetRecord._id);

            return { message: "Password has been reset successfully." };
        } catch (error: any) {
            if (error instanceof HttpError) {
                throw error;
            }
            throw new HttpError(400, "Invalid or expired token");
        }
    }

    async verifyResetOtp(email: string, otp: string, newPassword: string) {
        if (!email || !otp || !newPassword) {
            throw new HttpError(400, "Email, OTP, and new password are required");
        }

        const filteredEmail = email.trim();
        const otpHash = hashOtp(otp);
        const resetRecord = await passwordResetRepository.findByOtp(filteredEmail, otpHash);

        if (!resetRecord) {
            // Decrement attempts for failed attempt
            const record = await passwordResetRepository.findByEmailAndType(filteredEmail, 'otp');
            if (record && record.attemptsLeft > 0) {
                await passwordResetRepository.decrementAttempts(record._id);
            }
            throw new HttpError(400, "Invalid OTP");
        }

        if (resetRecord.used) {
            throw new HttpError(400, "This OTP has already been used");
        }

        if (resetRecord.attemptsLeft <= 0) {
            throw new HttpError(400, "OTP attempts exceeded");
        }

        const user = await userRepository.getUserById(resetRecord.userId.toString());
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        const hashedPassword = await bcryptjs.hash(newPassword, 10);
        await userRepository.updateUser(user._id.toString(), { password: hashedPassword });
        await passwordResetRepository.markAsUsed(resetRecord._id);

        return { message: "Password has been reset successfully." };
    }

}
