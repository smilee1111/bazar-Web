import  {Router,Response,Request} from  'express';
import { BookController } from '../controllers/book.controller';

const router: Router = Router();
const bookController = new BookController();

router.get('/', bookController.getBooks);

//make a router that handles GET request that takes bookid
// /:bookid and calls bookController.getBookById

router.get('/:bookid',bookController.getBookById);
export default router;