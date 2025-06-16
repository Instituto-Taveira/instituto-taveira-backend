import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { v4 as uuid } from 'uuid';
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

            const roles = await this.role.findMany();
            if (roles.length === 0) {
                  await this.role.create({
                        data: {
                              id: uuid(),
                              name: 'admin',
                        },
                  });
                  await this.role.create({
                        data: {
                              id: uuid(),
                              name: 'user',
                        },
                  });
            }

            await this.$connect();
      }

      async onModuleDestroy() {
            await this.$disconnect();
      }
}
