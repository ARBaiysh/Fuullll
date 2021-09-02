import {Injectable} from '@angular/core';
import {Observable, of} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class Luv2ShopFormService {

  constructor() {
  }

  getCreditCardMonths(startMonth: number): Observable<number[]> {
    let date: number[] = [];
    for (let i = startMonth; i <= 12; i++) date.push(i)
    return of(date);
  }

  getCreditCardYears(): Observable<number[]> {
    let date: number[] = [];
    const startYear: number = new Date().getFullYear();
    const endYear: number = startYear + 10;
    for (let i = startYear; i <= endYear; i++) date.push(i)
    return of(date);
  }
}
