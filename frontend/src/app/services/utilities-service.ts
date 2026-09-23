import { Service } from '@angular/core';

export function getImage(img: string | null | undefined) {
  if (img === null || img == undefined) {
    return 'http://localhost:8080/uploads/No_Image_Available.jpg';
  } else {
    return 'http://localhost:8080' + img;
  }
  
}

export function sleep(millis: number) {
  return new Promise(resolve => setTimeout(resolve, millis));
}
