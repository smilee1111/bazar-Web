import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { JWT_SECRET} from "../config";
import { IUser, IUserPopulated } from "../models/user.model";
import { UserRepository } from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";
import { ROLE_NAMES } from "../constants/roles";

let userRepository = new UserRepository();

declare global { 
    namespace Express {
        interface Request{
            user?: Record<string, any> | IUser | IUserPopulated
        }
    }
}

export async function authorizedMiddleware(req: Request, res: Response,next: NextFunction) {

    try{ 
        //defining bearer header 
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer "))
            throw new HttpError( 401, "Unauthorized, No bearer Token");

        //seperating the jwt from header
        const token = authHeader.split(" ")[1];
        if(!token)
            throw new HttpError( 401, " Unauthorized, Missing Token");

        //decoding the jwt and comparing
        const decoded = jwt.verify(token, JWT_SECRET) as Record<string, any>;
        if(!decoded || !decoded.id)
            throw new HttpError( 401, "Unauthorized, Invalid Token");

        //returning the user if found
        const user = await userRepository.getUserById( decoded.id );
        if(!user)
            throw new HttpError( 401, "Unauthorized, User Not Found");

        req.user = user;
        return next();
    }catch(err: Error | any){
        return res.status(err.statusCode || 500 ).json(
            { success: false, message: err.message || "Unauthorized" }
        )
    }

}


export async function adminMiddleware(req: Request, res: Response, next: NextFunction){
        try{
            //req.user is set in authorizedMiddleware
            //only use role/admin middleware after user is authorized
            if(!req.user)
                throw new HttpError( 401, " Unauthorized, User not found");
            
            // Check if roleId is populated and has roleName property
            const user = req.user as IUserPopulated;
            // Ensure roleId is populated (not just an ObjectId)
            if(!user.roleId || typeof user.roleId === 'string' || !('roleName' in user.roleId) || user.roleId.roleName !== ROLE_NAMES.ADMIN)
                throw new HttpError( 403, "Forbidden Admins only");

            return next();
            
        }catch(err: Error | any ){
            return res.status(err.statusCode || 500).json(
             { success: false, message: err.message || "Unauthorized" }
        )
        }

}

// Optional authentication - doesn't fail if no token, just sets req.user if authenticated
export async function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            // No token, continue without user
            return next();
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, JWT_SECRET) as Record<string, any>;
        if (decoded && decoded.id) {
            const user = await userRepository.getUserById(decoded.id);
            if (user) {
                req.user = user;
            }
        }
        return next();
    } catch (err) {
        // Ignore errors in optional auth, just continue
        return next();
    }
}