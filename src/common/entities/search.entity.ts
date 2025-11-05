

export class GetAllResponse<T=any>{
    result:{
         docsCount?:number;
         limit?:number;
         pages?:number;
         currentPage?:number;
         result:T[];


    }
}