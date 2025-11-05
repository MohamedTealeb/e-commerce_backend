
import { IResponse } from './../interfaces/response.interfae';

export const succesResponse =<T=any>({data,message='Done',status=200}:IResponse<T>):IResponse<T>=>{


    return{message,status,data}





}
