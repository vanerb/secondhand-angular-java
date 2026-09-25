import { Availability } from "../enums/availability";
import { Condition } from "../enums/condition";


export interface ProductFilter {

  name?: string;

  category?: string;

  minPrice?: number;

  maxPrice?: number;

  condition?: Condition;

  availability?: Availability;

  userId?: number;

  page?: number;

  size?: number;

  sort?: string;
}