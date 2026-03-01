// src/prisma/prisma.module.ts
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // si tu veux que Prisma soit disponible partout
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}