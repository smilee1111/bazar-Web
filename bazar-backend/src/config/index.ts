import dotenv from 'dotenv';
import path from 'path';

// Load .env from root
dotenv.config();

// Load config.env from config directory
dotenv.config({ path: path.join(__dirname, 'config.env') });

export const PORT: number = 
    process.env.PORT ? parseInt(process.env.PORT) : 5050;
//ensure PORT is a number, and fallback if not found 
//avoid exception if env is missing

export const LOCAL_DATABASE_URI: string =
    process.env.LOCAL_DATABASE_URI || 'mongodb://localhost:27017/bazar';
//local MongoDB URI

export const MONGO_URI: string =
    process.env.MONGO_URI || 'mongodb://localhost:27017/bazar';
//fallback to local mongo db if env is missing 

export const JWT_SECRET: string = 
process.env.JWT_SECRET || "";
//Application level CONSTANTS