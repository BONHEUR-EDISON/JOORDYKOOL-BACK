// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // ⚡ passer {} pour éviter l'erreur d'initialisation
    super({});
  }

  async onModuleInit() {
    console.log('🌱 Connecting to MySQL local...');
    await this.$connect();
  }

  async onModuleDestroy() {
    console.log('🛑 Disconnecting from MySQL...');
    await this.$disconnect();
  }
}
