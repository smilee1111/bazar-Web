import express, {Application, Request, Response} from 'express';
import { conectDB } from './database/mongodb';
import bodyParser from 'body-parser';
import { PORT } from './config';
import cors from 'cors';

//importing and initializing the env file 
import dotenv from 'dotenv';
// Load environment variables
dotenv.config({ path: "./config/config.env" });


//can use env variables below this 
console.log(process.env.PORT);
// .env -> PORT=5050

const app: Application = express();
let corsOptions = {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",")
      : [],
    //list of domains allowed to access the server
    //frontend domain/url
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//origin: "*", //allow all domains
app.use(cors(corsOptions));

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

//ADMIN
//importing the routes for admin 
import adminRoutes from './routes/admin/user.route';
//defining the path for usage of admin routes
app.use('/api/admin/users', adminRoutes);


//starting the mongodb server
async function startServer(){
    await conectDB();
 app.listen(PORT, '0.0.0.0', () => {  // Bind to all network interfaces so the server is reachable from containers or other hosts during development
    console.log(`Server on http://localhost:${PORT}`);
});
}
startServer();