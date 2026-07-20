import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import type { Response } from 'express';
import { join } from 'path';
import { AndettaService } from './andetta.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

@ApiTags('andetta')
@Controller('andetta')
export class AndettaController {
  constructor(private andettaService: AndettaService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get andetta PDF info' })
  async getInfo() {
    return this.andettaService.getInfo();
  }

  @Get('pdf')
  @Public()
  @ApiOperation({ summary: 'Download andetta PDF' })
  async getPdf(@Res() res: Response) {
    const info = await this.andettaService.getInfo();
    if (!info.filename) {
      return res.status(404).json({ message: 'PDF not found' });
    }
    const filePath = join(
      process.cwd(),
      'uploads',
      'andetta',
      info.filename,
    );
    return res.sendFile(filePath);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @RequirePermissions('manage_settings')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload andetta PDF' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'andetta'),
        filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `andetta-${uniqueSuffix}.pdf`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new Error('Only PDF files are allowed'), false);
        }
      },
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.andettaService.upload(file.filename);
  }
}
