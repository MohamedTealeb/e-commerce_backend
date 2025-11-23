import { Controller, Get, Res, Param } from '@nestjs/common';
import { AppService } from './app.service';
import type { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/:folder/:filename')
  getImage(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const imagePath = join(process.cwd(), 'uploads', folder, filename);
    
    if (!existsSync(imagePath)) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    return res.sendFile(imagePath);
  }
}
