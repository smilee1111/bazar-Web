import express, {Application, Request, Response} from 'express';
import { conectDB } from './database/mongodb';
import bodyParser from 'body-parser';
import { PORT } from './config';

//importing and initializing the env file 
import dotenv from 'dotenv';
dotenv.config();

//can use env variables below this 
console.log(process.env.PORT);
// .env -> PORT=5050

const app: Application = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//test api
app.get('/',(req:Request,res:Response) => {
    res.send("Hello World!");
});

//AUTH
//importing the routes for auth
import authRoutes from './routes/auth/auth.route';
//defining the path for usage of auth routes 
app.use('/api/auth',authRoutes);

//ADMIN
//importing the routes for admin 
import adminRoutes from './routes/admin/user.route';
//defining the path for usage of admin routes
app.use('/api/admin/users', adminRoutes);


//starting the mongodb server
async function startServer(){
    await conectDB();
    app.listen(
    PORT,
    () => {
        console.log(`Server on http://localhost:${PORT}`);
    }
);
}
startServer();