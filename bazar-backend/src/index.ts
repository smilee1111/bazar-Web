import express, {Application, Request, Response} from 'express';
import bookRoutes from './routes/book.route';
import { conectDB } from './database/mongodb';

import dotenv from 'dotenv';
dotenv.config();
//can use env variables below this 
console.log(process.env.PORT);
// .env -> PORT=5050

const app: Application = express();
const PORT: number = 3000;

app.get('/',(req:Request,res:Response) => {
    res.send("Hello World!");
});

app.use('api/books', bookRoutes);


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