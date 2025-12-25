import {z} from 'zod';
import { BookSchema } from '../types/book.type';
//DTO - Data Transfer Object
//Input/Output structure
export const CreateBookDTO= BookSchema.pick({id: true, title: true});
export type  CreateBookDTO = z.infer<typeof CreateBookDTO>;
