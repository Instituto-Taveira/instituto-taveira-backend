import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
      async onModuleInit() {
            const admin = await this.user.findFirst({
                  where: {
                        login: 'adm@gmail.com',
                  },
            });

            if (!admin) {
                  await this.user.create({
                        data: {
                              id: new Date().getTime().toString(),
                              name: 'Admin',
                              login: 'adm@gmail.com',
                              password: '123456',
                              isAdm: true,
                              createdAt: new Date(),
                              updatedAt: new Date(),
                        },
                  });
            }

            await this.$connect();
      }

      async onModuleDestroy() {
            await this.$disconnect();
      }
}
