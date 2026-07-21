import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { existsSync, renameSync, unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class AndettaService {
  private readonly uploadsDir = join(process.cwd(), 'uploads', 'andetta');

  constructor(private prisma: PrismaService) {}

  private async getSetting(key: string): Promise<string | null> {
    const row = await this.prisma.setting.findUnique({ where: { key } });
    return row?.value ?? null;
  }

  private async setSetting(key: string, value: string) {
    await this.prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async getInfo() {
    let current = await this.getSetting('andetta_current');
    const previous = await this.getSetting('andetta_previous');
    const active = await this.getSetting('andetta_active');

    if (!current) {
      const oldFile = await this.getSetting('andetta_pdf');
      if (oldFile) {
        await this.setSetting('andetta_current', oldFile);
        current = oldFile;
      }
    }

    return {
      current,
      previous,
      active: (active as 'current' | 'previous') || 'current',
    };
  }

  async getActivePdf(): Promise<string> {
    const info = await this.getInfo();
    const filename = info.active === 'previous' ? info.previous : info.current;
    if (!filename) throw new NotFoundException('PDF not found');
    const filePath = join(this.uploadsDir, filename);
    if (!existsSync(filePath)) throw new NotFoundException('PDF not found');
    return filePath;
  }

  async upload(filename: string) {
    const currentFilename = await this.getSetting('andetta_current');
    const previousFilename = await this.getSetting('andetta_previous');

    if (previousFilename) {
      const oldPrevPath = join(this.uploadsDir, previousFilename);
      if (existsSync(oldPrevPath)) unlinkSync(oldPrevPath);
    }

    if (currentFilename) {
      const curPath = join(this.uploadsDir, currentFilename);
      const newPrevName = `andetta-prev-${Date.now()}.pdf`;
      const prevPath = join(this.uploadsDir, newPrevName);
      if (existsSync(curPath)) renameSync(curPath, prevPath);
      await this.setSetting('andetta_previous', newPrevName);
    }

    await this.setSetting('andetta_current', filename);
    await this.setSetting('andetta_active', 'current');

    return this.getInfo();
  }

  async switchVersion(version: 'current' | 'previous') {
    const info = await this.getInfo();
    const filename = version === 'previous' ? info.previous : info.current;
    if (!filename) throw new NotFoundException(`Version "${version}" not found`);
    await this.setSetting('andetta_active', version);
    return this.getInfo();
  }
}
