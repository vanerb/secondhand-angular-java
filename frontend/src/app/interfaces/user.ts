import { Image } from './images';

export interface User {
  id: number;
  email: string;
  image: Image;
  name: string;
  username: string;
  cogname: string;
}
