import {Component, OnInit} from '@angular/core';
import {ProductService} from 'src/app/services/product.service';
import {Product} from 'src/app/common/product';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products!: Product[];
  currentCategoryId!: number;
  searchMode!: boolean;

  constructor(private productService: ProductService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }

  listProducts() {
    this.searchMode = this.route.snapshot.paramMap.has('keyword');

    this.searchMode ? this.handleSearchProducts() : this.handleListProducts();
  }

  private handleSearchProducts() {
    const theKeyword: string = this.route.snapshot.paramMap.get('keyword')!;

    this.productService.searchProducts(theKeyword).subscribe(data => {
      this.products = data
    });
  }

  handleListProducts() {
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    hasCategoryId ? this.currentCategoryId = +this.route.snapshot.paramMap.get('id')! : this.currentCategoryId = 1;

    this.productService.getProductList(this.currentCategoryId).subscribe(data => {
      this.products = data;
    });
  }
}
