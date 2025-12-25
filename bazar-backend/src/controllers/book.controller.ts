import { Request,Response } from "express"; 
import { CreateBookDTO } from "../dtos/book.dto";
import { Book } from "../types/book.type";
import { BookService } from "../services/book.service";

import {z} from "zod";



// export type Book= {
//     id: string,
//     title: string,
//     date?: string
// }


let bookService = new BookService();

export class BookController{
    createBook(req: Request, res: Response){
        try{
        const parsedBook = CreateBookDTO.safeParse(req.body);
            
        //auto validation
        if(!parsedBook.success){
            return res.status(400).json({errors: parsedBook.error});
        }
        const {id, title} = parsedBook.data;
        // const{id,title}=req.body;//destructure
        //not required becasue of auto validation through schema 
        // if(!title){
        //     return res.status(400).json({message: "Tile is required."});
        // }
        // if(!id){
        //     return res.status(400).json({message: "ID is required."});
        // }
        
        const newBook: Book = bookService.createBook({id, title});
        return res.status(201).json(newBook);
        }
        catch(error: Error | any){
        return res.status(500).send(error.message ?? "Internal Server Error");
        }
    }
    getBooks(req: Request,res: Response) {
        const requestBook: Book[] =bookService.getAllBooks();
        return res.status(200).json(requestBook);
    }   

    getBookById(req: Request,res: Response) { 

        try{
            const requestedBookId: Book[] = bookService.getBookById({id: req.params.bookid, title: ""});
            return res.status(200).json(requestedBookId);
        }catch(error: Error | any){
            return res.status(500).send(error.message ?? "Internal Server Error");
        }
    }
}