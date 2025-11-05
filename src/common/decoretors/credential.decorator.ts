
import { createParamDecorator,ExecutionContext } from "@nestjs/common";

export const    User=createParamDecorator(
    (data:unknown,context:ExecutionContext)=>{
        let req:any;

        switch(context.getType()){
            case 'http':
                req=context.switchToHttp().getRequest();
                break;}
        return req.credentials?.user || req.credentials
    }
)