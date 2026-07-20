import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class AndettaService {
  private readonly uploadsDir = join(process.cwd(), 'uploads', 'andetta');

  constructor(private prisma: PrismaService) {}

  async getInfo() {
    const setting = await this.prisma.setting.findUnique({
      where: { key: 'andetta_pdf' },
    });
    return { filename: setting?.value ?? null };
  }

  async upload(filename: string) {
    await this.prisma.setting.upsert({
      where: { key: 'andetta_pdf' },
      update: { value: filename },
      create: { key: 'andetta_pdf', value: filename },
    });
    return { filename };
  }

  getFilePath(filename: string): string {
    const filePath = join(this.uploadsDir, filename);
    if (!existsSync(filePath)) {
      throw new NotFoundException('PDF not found');
    }
    return filePath;
  }
}
