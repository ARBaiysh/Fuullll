import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Luv2ShopFormService} from "../../services/luv2-shop-form.service";
import {Country} from "../../common/country";
import {State} from "../../common/state";
import {Lov2ShopValidators} from "../../validators/lov2-shop-validators";
import {CartService} from "../../services/cart.service";
import {CheckoutService} from "../../services/checkout.service";
import {Router} from "@angular/router";
import {Order} from "../../common/order";
import {OrderItem} from "../../common/order-item";
import {Purchase} from "../../common/purchase";

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup!: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries!: Country[];
  shippingAddressStates!: State[];
  billingAddressStates!: State[];


  constructor(private formBuilder: FormBuilder,
              private luv2ShopFormService: Luv2ShopFormService,
              private cardService: CartService,
              private checkoutService: CheckoutService,
              private router: Router) {
  }

  ngOnInit(): void {

    this.reviewCardDetails();

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl(``, [Validators.required, Validators.minLength(2), Lov2ShopValidators.notOnlyWhitespace]),
        lastName: new FormControl(``, [Validators.required, Validators.minLength(2), Lov2ShopValidators.notOnlyWhitespace]),
        email: new FormControl(``, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        country: new FormControl(``, [Validators.required]),
        street: new FormControl(``, [Validators.required, Validators.minLength(2), Lov2ShopValidators.notOnlyWhitespace]),
        city: new FormControl(``, [Validators.required, Validators.minLength(2), Lov2ShopValidators.notOnlyWhitespace]),
        state: new FormControl(``, [Validators.required]),
        zipCode: new FormControl(``, [Validators.required, Validators.minLength(2), Lov2ShopValidators.notOnlyWhitespace])
      }),
      billingAddress: this.formBuilder.group({
        country: new FormControl(``, [Validators.required]),
        street: new FormControl(``, [Validators.required, Validators.minLength(2), Lov2ShopValidators.notOnlyWhitespace]),
        city: new FormControl(``, [Validators.required, Validators.minLength(2), Lov2ShopValidators.notOnlyWhitespace]),
        state: new FormControl(``, [Validators.required]),
        zipCode: new FormControl(``, [Validators.required, Validators.minLength(6), Lov2ShopValidators.notOnlyWhitespace])
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl(``, [Validators.required]),
        nameOnCard: new FormControl(``, [Validators.required, Validators.minLength(2), Lov2ShopValidators.notOnlyWhitespace]),
        cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']
      }),
    });

    const startMonth: number = new Date().getMonth() + 1;

    this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe(data => this.creditCardMonths = data);
    this.luv2ShopFormService.getCreditCardYears().subscribe(data => this.creditCardYears = data);
    this.luv2ShopFormService.getCountries().subscribe(date => this.countries = date);

  }

  onSubmit() {
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    const cartItems = this.cardService.cartItems;

    let orderItems: OrderItem[] = cartItems.map(data => new OrderItem(data));

    let purchase = new Purchase();

    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;


    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    purchase.order = order;
    purchase.orderItems = orderItems;

    this.checkoutService.placeOrder(purchase).subscribe({
      next: response => {
        alert(`Your order has been received.\nOrder tracking: ${response.orderTrackingNumber}`);
        this.restCart();
      },
      error: err => {
        alert(`There was an error: ${err.message}`);
      }
    });


  }


  private restCart() {
    this.cardService.cartItems = [];
    this.cardService.totalPrice.next(0);
    this.cardService.totalQuantity.next(0);

    this.checkoutFormGroup.reset();

    this.router.navigateByUrl("/products");

  }

  copySippingAddressToBillingAddress(event: Event) {

    if ((event.target as HTMLInputElement).checked) {
      this.checkoutFormGroup.controls.billingAddress
        .setValue(this.checkoutFormGroup.controls.shippingAddress.value);

      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkoutFormGroup.controls.billingAddress.reset();
      this.billingAddressStates = [];
    }
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get(`creditCard`);
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear);

    let startMonth: number;

    currentYear === selectedYear ? startMonth = new Date().getMonth() + 1 : startMonth = 1;

    this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe(data => this.creditCardMonths = data);

  }

  getStates(fromGroupName: string) {
    const fromGroup = this.checkoutFormGroup.get(fromGroupName);
    const countryCode = fromGroup?.value.country.code;


    console.log(`${fromGroup} country code: ${countryCode}`)
    console.log(`${fromGroup} country name: ${fromGroup?.value.country.name}`)

    this.luv2ShopFormService.getStates(countryCode).subscribe(
      data => {
        fromGroupName === 'shippingAddress' ? this.shippingAddressStates = data : this.billingAddressStates = data;
        fromGroup?.get('state')?.setValue(data[0]);
      });
  }

  private reviewCardDetails() {
    this.cardService.totalQuantity.subscribe(date => this.totalQuantity = date)
    this.cardService.totalPrice.subscribe(date => this.totalPrice = date)
  }
  // customer getter

  get firstName() {
    return this.checkoutFormGroup.get('customer.firstName')!;
  }

  get lastName() {
    return this.checkoutFormGroup.get('customer.lastName')!;
  }


  get email() {
    return this.checkoutFormGroup.get('customer.email')!;
  }
  //shippingAddress getter

  get shippingAddressStreet() {
    return this.checkoutFormGroup.get('shippingAddress.street')!;
  }

  get shippingAddressCountry() {
    return this.checkoutFormGroup.get('shippingAddress.country')!;
  }

  get shippingAddressCity() {
    return this.checkoutFormGroup.get('shippingAddress.city')!;
  }

  get shippingAddressState() {
    return this.checkoutFormGroup.get('shippingAddress.state')!;
  }


  get shippingAddressZipCode() {
    return this.checkoutFormGroup.get('shippingAddress.zipCode')!;
  }
  //billing getter

  get billingAddressStreet() {
    return this.checkoutFormGroup.get('billingAddress.street')!;
  }

  get billingAddressCountry() {
    return this.checkoutFormGroup.get('billingAddress.country')!;
  }

  get billingAddressCity() {
    return this.checkoutFormGroup.get('billingAddress.city')!;
  }

  get billingAddressState() {
    return this.checkoutFormGroup.get('billingAddress.state')!;
  }

  get billingAddressZipCode() {
    return this.checkoutFormGroup.get('billingAddress.zipCode')!;
  }

  //creditCard getter

  get creditCardType() {
    return this.checkoutFormGroup.get('creditCard.cardType')!;
  }

  get creditCardNameOnCard() {
    return this.checkoutFormGroup.get('creditCard.nameOnCard')!;
  }

  get creditCardNumber() {
    return this.checkoutFormGroup.get('creditCard.cardNumber')!;
  }


  get creditCardSecurityCode() {
    return this.checkoutFormGroup.get('creditCard.securityCode')!;
  }
}

