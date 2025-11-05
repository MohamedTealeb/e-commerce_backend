import { PutObjectCommand, S3Client, ObjectCannedACL, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { BadRequestException, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { createReadStream } from "fs";
import { StorageEnum } from "src/common/enums/multer.enums";

@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION as string,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    });
  }

  async uploadFile({
    storageApproach = StorageEnum.memory,
    Bucket = process.env.AWS_BUCKET_NAME,
    ACL = "private",
    path = "general",
    file,
  }: {
    storageApproach?: StorageEnum;
    Bucket?: string;
    ACL?: ObjectCannedACL;
    path: string;
    file: Express.Multer.File;
  }): Promise<string> {
    const command = new PutObjectCommand({
      Bucket,
      ACL,
      Key: `${process.env.APPLICATION_NAME}/${path}/${randomUUID()}_${file.originalname}`,
      Body:
        storageApproach === StorageEnum.memory
          ? file.buffer
          : createReadStream(file.path),
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    if (!command?.input?.Key) {
      throw new BadRequestException("failed to generate upload key");
    }

    return command.input.Key;
  }

  async deleteFile({
    path,
  }: {
    path: string;
  }): Promise<string> {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: path,
    });
    await this.s3Client.send(command);
    if(!command?.input?.Key){
      throw new BadRequestException('failed to generate delete key');
    }
    return command.input.Key;
  }
}
