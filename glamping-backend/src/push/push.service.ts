import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import * as webPush from 'web-push';

@Injectable()
export class PushService {
  private readonly logger = new Logger('Push');
  private initialized = false;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const publicKey = this.config.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.config.get<string>('VAPID_PRIVATE_KEY');
    const subject = this.config.get<string>('VAPID_SUBJECT');

    if (publicKey && privateKey && subject) {
      webPush.setVapidDetails(subject, publicKey, privateKey);
      this.initialized = true;
    }
  }

  getPublicKey(): string | null {
    return this.config.get<string>('VAPID_PUBLIC_KEY') || null;
  }

  async subscribe(endpoint: string, p256dh: string, p256da: string) {
    await this.prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { p256dh, p256da },
      create: { endpoint, p256dh, p256da },
    });
  }

  async unsubscribe(endpoint: string) {
    await this.prisma.pushSubscription.deleteMany({ where: { endpoint } });
  }

  async sendNotification(payload: {
    title: string;
    body: string;
    icon?: string;
    url?: string;
  }) {
    if (!this.initialized) return;

    const subscriptions = await this.prisma.pushSubscription.findMany();
    const message = JSON.stringify(payload);

    for (const sub of subscriptions) {
      try {
        await webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, p256da: sub.p256da },
          },
          message,
        );
      } catch (err: any) {
        this.logger.error(`Push failed for ${sub.endpoint}: ${err.message}`);
        if (err.statusCode === 404 || err.statusCode === 410) {
          await this.prisma.pushSubscription.deleteMany({
            where: { endpoint: sub.endpoint },
          });
        }
      }
    }
  }
}
