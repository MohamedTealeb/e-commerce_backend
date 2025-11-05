import {  diskStorage, memoryStorage } from "multer";
import { Request } from "express";

import { IMulterFile } from "src/common/interfaces/multer.interface";
import { BadRequestException } from "@nestjs/common";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { StorageEnum } from "src/common/enums/multer.enums";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

export const cloudFileUpload = ({storageApproach=StorageEnum.memory, vaildation=[],fileSize=2}: { storageApproach:StorageEnum, vaildation:string[],fileSize?:number }):MulterOptions => {

  return {
    storage:
    storageApproach===StorageEnum.memory?memoryStorage():diskStorage({
        destination:tmpdir(),
        filename:(req:Request,file:IMulterFile,callback:Function)=>{
            callback(null,`${randomUUID()}_${file.originalname}`)
    }
    }
)

    
    ,
    fileFilter(req: Request, file: IMulterFile, callback: Function) {
 
         if(vaildation.includes(file.mimetype)){
             return callback(null,true)
         }
         return callback(new BadRequestException('Invalid file type'))
    },
    limits:{
        fileSize:fileSize *1024*1024,
    }
  };
};
