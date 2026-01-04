import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { JWT_SECRET} from "../config";
import { IUser } from "../models/user.model";
import { UserRepository } from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";

let userRepository = new UserRepository();

declare global { 
    namespace Express {
        interface Request{
            user?: Record<string, any> | IUser
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

        req. user = user;
        return next;
    }catch(err: Error | any){
        return res.status(err.statusCode || 500 ).json(
            { success: false, message: err.message || "Unauthorized" }
        )
    }

}


export async function adminMiddleware(req: Request, res: Response, next: NextFunction){
        try{
            //req.user is set in authorizedMiddleware
            //omly use role/admin middleware after user is authorized
            if(!req.user)
                throw new HttpError( 401, " Unauthorized, User not found");
            if(req.user.role !== 'admin')
                throw new HttpError( 403, "Forbidden Admins only");

            return next();
            
        }catch(err: Error | any ){
            return res.status(err.statusCode || 500).json(
             { success: false, message: err.message || "Unauthorized" }
        )
        }

}