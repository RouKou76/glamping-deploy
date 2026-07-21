import {
  Controller,
  Get,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiProperty } from '@nestjs/swagger';
import type { Response } from 'express';
import { join } from 'path';
import { IsIn } from 'class-validator';
import { AndettaService } from './andetta.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

class SwitchVersionDto {
  @ApiProperty({ enum: ['current', 'previous'] })
  @IsIn(['current', 'previous'])
  version: 'current' | 'previous';
}

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
  @ApiOperation({ summary: 'Download active andetta PDF' })
  async getPdf(@Res() res: Response) {
    const filePath = await this.andettaService.getActivePdf();
    res.set('Cache-Control', 'no-store');
    return res.sendFile(filePath);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @RequirePermissions('manage_settings')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload new andetta PDF version' })
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

  @Post('switch')
  @UseGuards(JwtAuthGuard)
  @RequirePermissions('manage_settings')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Switch active PDF version' })
  async switchVersion(@Body() dto: SwitchVersionDto) {
    return this.andettaService.switchVersion(dto.version);
  }
}
