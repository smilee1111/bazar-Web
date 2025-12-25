//Business Layer

import { CreateBookDTO } from "../dtos/book.dto";
import { Book } from "../types/book.type";
import { IBookRepository,BookRepository } from "../repositories/book.repository";
import { response } from "express";


let bookRepository: IBookRepository = new BookRepository();

export class BookService {
    createBook(book: CreateBookDTO){
        //business logic
        const exist = bookRepository.findBookById(book.id);
        if(exist){
            throw new Error("Book Id already exists");
        }
        const newBook: Book = {
            id: book.id,
            title: book.title
        }; 
        let created: Book = bookRepository.createBook(newBook);
        //latter transform/map
        //...
        return created;
    }

    getAllBooks(): Book[]{

    //transform data /business logic
    let response: Book[] = bookRepository
    .getBooks()
    .map(
        (book) => {
            return {
                ...book,
                title: book.title.toUpperCase()
            }
    }
    );
        return response;
    }
    

    getBookById(book: CreateBookDTO): 
        Book[]{
        // const exist = bookRepository.findBookById(book.id);
        //  if(!exist){
        //     throw new Error("Book Id doesnot exists");
        // }
        // let response: Book[] =bookRepository
        // .findBookById(book.id) ? [bookRepository.findBookById(book.id)!] : []
        // .map(
        //     (books) => {
        //         return books.find
        //         (book=> 
        //             book.id === id);
        //     }

        // );
        // return response;
        const found = bookRepository.findBookById(book.id);

        if (!found) throw new Error("Book Id does not exist");

        return [found].map((b: Book) => b);
    }
}