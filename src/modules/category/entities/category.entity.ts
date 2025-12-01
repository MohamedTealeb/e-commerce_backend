import { ICategory } from "src/common/interfaces/category.interface";
import { GetAllResponse } from "src/common/entities/search.entity";
import { ProductResponse } from "src/modules/product/entities/product.entity";

export class CategoryResponse {
category:ICategory;
}

export class CategoryWithProductsResponse {
  category: ICategory;
  products: GetAllResponse<ProductResponse>;
}
