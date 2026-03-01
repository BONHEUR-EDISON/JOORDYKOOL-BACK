import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StoriesService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.story.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, imageUrl: string) {
    return this.prisma.story.create({
      data: { userId, imageUrl },
      include: { user: true },
    });
  }
}
