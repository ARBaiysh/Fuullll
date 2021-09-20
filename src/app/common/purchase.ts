import {Customer} from "./customer";
import {Order} from "./order";
import {OrderItem} from "./order-item";
import {Address} from "./address";

export class Purchase {
  customer!: Customer;
  shippingAddress!: Address;
  billingAddress!: Address;
  order!: Order;
  orderItems!: OrderItem[];

}
