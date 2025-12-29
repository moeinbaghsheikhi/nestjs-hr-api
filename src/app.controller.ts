import { BadRequestException, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './modules/auth/decorators/public.decorator';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
    if(!existsSync('./uploads')){
      mkdirSync('./uploads', { recursive: true })
    }
  }

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('uploads')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'آپلود فایل' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'فایل برای آپلود'
        }
      }
    }
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1000)}${extname(file.originalname)}`;
          cb(null, uniqueName);
        }
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        const allowMimes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'application/pdf'
        ];

        if(allowMimes.includes(file.mimetype)){
          cb(null, true);
        } else {
          cb(new BadRequestException('نوع فایل مجاز نیست!') ,false)
        }
      }
    })
  )
  upload(@UploadedFile() file: any) {
    if(!file) throw new BadRequestException('فایلی آپلود نشده است!');

    return {
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: `/uploads/${file.filename}`
    }
  }
}
