
import { IResponse, IErrorResponse, ApiResponse } from './../interfaces/response.interfae';

export const succesResponse =<T=any>({data,message='Done',status=200}:IResponse<T>):IResponse<T>=>{
    return{message,status,data}
}

export const errorResponse = ({cause,errorMessage,status=400}:Omit<IErrorResponse,'message'>):IErrorResponse=>{
    return{message:'Done',status,cause,errorMessage: errorMessage ?? cause ?? 'An unexpected error occurred'}
}

export type { ApiResponse };
