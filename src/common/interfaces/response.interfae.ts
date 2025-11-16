


export interface IResponse <T=any>{

    message?:string
    status?:number
    data:T

}

export interface IErrorResponse {
    
    message?:string
    cause:string
    errorMessage:string
    status?:number
}

export type ApiResponse<T = any> = IResponse<T> | IErrorResponse;