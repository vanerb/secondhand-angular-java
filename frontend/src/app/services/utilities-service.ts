import { Service } from '@angular/core';

export function getImage(img: string | null | undefined) {
  if (img === null || img == undefined) {
    return 'http://localhost:8080/uploads/No_Image_Available.svg';
  } else {
    return 'http://localhost:8080' + img;
  }
}
