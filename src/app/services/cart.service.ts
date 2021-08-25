import { Injectable } from '@angular/core';
import {CartItem} from "../common/cart-item";

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartItems: CartItem[] = [];

  constructor() { }
}
