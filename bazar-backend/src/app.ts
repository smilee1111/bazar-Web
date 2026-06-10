import express, {Application, Request, Response, NextFunction} from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';


//importing and initializing the env file 
import dotenv from 'dotenv';
// Load environment variables
dotenv.config({ path: "./config/config.env" });

// Import rate limiting middleware
import { generalLimiter, readLimiter, writeLimiter } from './middlewares/rateLimiter.middleware';

//can use env variables below this 
console.log(process.env.PORT);
// .env -> PORT=5050

const app: Application = express();
let corsOptions = {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",")
      : ['http://localhost:3000'],
    //list of domains allowed to access the server
    //frontend domain/url

}

// Trust proxy for rate limiting and security headers
// This allows proper IP detection when behind reverse proxies (nginx, Cloudflare, etc.)
app.set('trust proxy', 1);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//origin: "*", //allow all domains
app.use(cors(corsOptions));

// Apply rate limiters to all routes
// These work together to allow normal browsing while protecting against abuse:
// - generalLimiter: 500 requests per 15 min (overall cap)
// - readLimiter: 300 GET requests per 5 min (browsing)
// - writeLimiter: 50 write operations per 15 min (POST/PUT/DELETE/PATCH)
app.use(generalLimiter);
app.use(readLimiter);
app.use(writeLimiter);

// Serve uploaded files with CORS headers
app.use('/uploads', cors(corsOptions), express.static(path.join(__dirname, '../uploads')));
//test api
app.get('/',(req:Request,res:Response) => {
    res.send("Hello World!");
});

//AUTH
//importing the routes for auth
import authRoutes from './routes/auth/auth.route';
//defining the path for usage of auth routes 
app.use('/api/auth',authRoutes);


//ROLE
//importing the routes for role
import roleRoutes from './routes/role/role.route';
//defining the path for usage of role routes
app.use('/api/roles', roleRoutes);

//CATEGORY
//importing the routes for category
import categoryRoutes from './routes/category/category.route';
//defining the path for usage of category routes
app.use('/api/categories', categoryRoutes);


//ADMIN
//ADMIN-USER-ROUTES

//importing the routes for admin 
import adminUserRoutes from './routes/admin/user/user.route';
//defining the path for usage of admin routes
app.use('/api/admin/users', adminUserRoutes);

//ADMIN-SELLER-APPLICATION-ROUTES
import adminSellerApplicationRoutes from './routes/admin/sellerApplication.route';
//defining the path for usage of admin seller application routes
app.use('/api/admin/seller-applications', adminSellerApplicationRoutes);

//ADMIN-SHOP-ROUTES
import adminShopRoutes from './routes/admin/shop.route';
app.use('/api/admin/shops', adminShopRoutes);

//ADMIN-SHOP-PHOTO-ROUTES
import adminShopPhotoRoutes from './routes/admin/shopPhoto.route';
app.use('/api/admin/shop-photos', adminShopPhotoRoutes);

//ADMIN-SHOP-REVIEW-ROUTES
import adminShopReviewRoutes from './routes/admin/shopReview.route';
app.use('/api/admin/shop-reviews', adminShopReviewRoutes);

//ADMIN-SHOP-DETAIL-ROUTES
import adminShopDetailRoutes from './routes/admin/shopDetail.route';
app.use('/api/admin/shop-details', adminShopDetailRoutes);

//USER SELF ROUTES 
//For user to edit their own details and view themselves
import userSelfRoutes from './routes/user/user_self.route';
app.use('/api/user', userSelfRoutes);

//USER SELLER APPLICATION ROUTES
import userSellerApplicationRoutes from './routes/user/sellerApplication.route';
app.use('/api/user/seller-applications', userSellerApplicationRoutes);

// USER - Saved shops & favourites
import userSavedShopRoutes from './routes/user/savedShop.route';
import userFavouriteRoutes from './routes/user/favourite.route';
import userReviewRoutes from './routes/user/review.route';
import notificationRoutes from './routes/user/notification.route';
import userBehaviourRoutes from './interactions_userbehaviour/routes/userBehaviour.route';
import recommendationRoutes from './routes/recommendation.routes';

app.use('/api/user/saved-shops', userSavedShopRoutes);
app.use('/api/user/favourites', userFavouriteRoutes);
app.use('/api/user/reviews', userReviewRoutes);
app.use('/api/user/notifications', notificationRoutes);
app.use('/api/user/behaviour', userBehaviourRoutes);
app.use('/api/recommendations', recommendationRoutes);

//SELLER ROUTES
import sellerShopRoutes from './routes/seller/shop.route';
app.use('/api/seller/shops', sellerShopRoutes);

//SHOP PUBLIC ROUTES
import shopPublicRoutes from './routes/shop/public';
import shopPhotoRoutes from './routes/shop/photo';
import shopReviewRoutes from './routes/shop/review';
import shopDetailRoutes from './routes/shop/detail';
app.use('/api/shops', shopPublicRoutes);
app.use('/api/shops', shopPhotoRoutes);
app.use('/api/shops', shopReviewRoutes);
app.use('/api/shops', shopDetailRoutes);

//MAPS ROUTES
import geocodingRoutes from './routes/maps/geocoding';
app.use('/api/maps', geocodingRoutes);

// Global error handler - return JSON for known error types (HttpError, MulterError)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  // Multer errors (file upload issues)
  if (err && err.name === 'MulterError') {
    return res.status(400).json({ status: 'error', statusCode: 400, message: err.message });
  }

  // Custom HttpError instances
  if (err && err.statusCode && err.message) {
    return res.status(err.statusCode).json({ status: 'error', statusCode: err.statusCode, message: err.message });
  }

  // Fallback
  const status = (err && err.statusCode) ? err.statusCode : 500;
  const message = (err && err.message) ? err.message : 'Internal Server Error';
  res.status(status).json({ status: 'error', statusCode: status, message });
});

export default app;