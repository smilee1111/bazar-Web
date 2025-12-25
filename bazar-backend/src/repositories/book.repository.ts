import { Book } from "../types/book.type";

let books: Book[] = [
    {id: 'B-1', title: 'Harry Potter'},
    {id: 'B-2', title: 'Lord of the rings', date:'29-05-2001'}
];

export interface IBookRepository{
    createBook(book: Book): Book;
    getBooks(): Book[];
    findBookById(id: string): Book | undefined;
}


export class BookRepository implements IBookRepository{
    createBook(book: Book): Book {
        books.push(book);
        return book;
    }

    getBooks(): Book[] {
        return books;
    }

    findBookById(id: string): Book | undefined {
        return books.find(book => book.id === id);
    }
}