import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {Luv2ShopFormService} from "../../services/luv2-shop-form.service";
import {Country} from "../../common/country";
import {State} from "../../common/state";

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
              private luv2ShopFormService: Luv2ShopFormService) {
  }

  ngOnInit(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        email: ['']
      }),
      shippingAddress: this.formBuilder.group({
        country: [''],
        street: [''],
        city: [''],
        state: [''],
        zipCode: ['']
      }),
      billingAddress: this.formBuilder.group({
        country: [''],
        street: [''],
        city: [''],
        state: [''],
        zipCode: ['']
      }),
      creditCard: this.formBuilder.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
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
    console.log('Handler the submit button')
    console.log(this.checkoutFormGroup.get('customer')?.value)
    console.log(`The shipping address country is: ` + this.checkoutFormGroup.get('shippingAddress')?.value.country.name)
    console.log(`The shipping address state is: ` + this.checkoutFormGroup.get('shippingAddress')?.value.state.name)
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
}

