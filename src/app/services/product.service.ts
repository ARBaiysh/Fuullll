import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Product} from '../common/product';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ProductCategory} from "../common/product-category";

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = 'http://localhost:8080/api/products';
  private categoryUrl = 'http://localhost:8080/api/product-category';

  constructor(private httpClient: HttpClient) {
  }

  getProductList(theCategoryId: number): Observable<Product[]> {
    return this.getProducts(`${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`);
  }

  searchProducts(theKeyword: string): Observable<Product[]> {
    return this.getProducts(`${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`);
  }

  private getProducts(searchUrl: string): Observable<Product[]> {
    return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(map(response => response._embedded.products));
  }

  getProductCategories(): Observable<ProductCategory[]> {
    return this.httpClient.get<GetResponseCategories>(this.categoryUrl).pipe(map(response => response._embedded.productCategory));
  }
}

interface GetResponseProducts {
  _embedded: { products: Product[]; }
}

interface GetResponseCategories {
  _embedded: { productCategory: ProductCategory[]; }
}
