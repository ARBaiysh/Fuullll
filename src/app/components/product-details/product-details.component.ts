import {Component, OnInit} from '@angular/core';
import {Product} from "../../common/product";
import {ProductService} from "../../services/product.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {

  product!: Product;

  constructor(private productService: ProductService, private router: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.router.paramMap.subscribe(() => {
      this.handlerProductDetails();
    })
  }

  private handlerProductDetails() {
    const theProductId: number = +this.router.snapshot.paramMap.get('id')!;
    this.productService.getProduct(theProductId).subscribe( date => {this.product = date})
  }
}
