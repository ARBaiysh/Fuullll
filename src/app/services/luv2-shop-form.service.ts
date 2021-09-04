import {Injectable} from '@angular/core';
import {Observable, of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Country} from "../common/country";
import {map} from "rxjs/operators";
import {State} from "../common/state";


@Injectable({
  providedIn: 'root'
})
export class Luv2ShopFormService {
  private countriesUrl = 'http://localhost:8080/api/countries';
  private statesUrl = 'http://localhost:8080/api/states';

  constructor(private httpClient: HttpClient) {
  }

  getCountries(): Observable<Country[]> {
    return this.httpClient.get<GetResponseCountries>(this.countriesUrl).pipe(map(response => response._embedded.countries));
  }

  getStates(theCountryCode: string): Observable<State[]> {
    const searchStateUrl = `${this.statesUrl}/search/findByCountryCode?code=${theCountryCode}`;
    return this.httpClient.get<GetResponseStates>(searchStateUrl).pipe(map(response => response._embedded.states));
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

interface GetResponseCountries {
  _embedded: { countries: Country[]; }
}

interface GetResponseStates {
  _embedded: { states: State[]; }
}
