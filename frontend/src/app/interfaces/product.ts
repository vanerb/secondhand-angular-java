import { Availability } from "../enums/availability";
import { Condition } from "../enums/condition";


export interface Product {

  id: number;

  name: string;

  category: string;

  price: number;

  condition: Condition;

  availability: Availability;

  userId: number;

  username: string;

  images: string[];

  favorite: boolean;
}