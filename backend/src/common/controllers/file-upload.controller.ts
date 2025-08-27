import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from '../services/file-upload.service';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/guards/roles.guard';
import { Roles } from '../../modules/auth/decorators/roles.decorator';

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('image')
  @Roles('admin', 'manager')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const filename = await this.fileUploadService.uploadFile(file);
    const fileUrl = this.fileUploadService.getFileUrl(filename);

    return {
      message: 'File uploaded successfully',
      filename,
      fileUrl,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  @Delete('image/:filename')
  @Roles('admin', 'manager')
  async deleteImage(@Param('filename') filename: string) {
    await this.fileUploadService.deleteFile(filename);
    return { message: 'File deleted successfully' };
  }
}
