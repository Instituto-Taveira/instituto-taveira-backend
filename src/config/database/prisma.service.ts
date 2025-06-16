import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
      async onModuleInit() {
            const roles = await this.role.findMany();
            if (roles.length === 0) {
                  await this.role.create({
                        data: {
                              name: 'admin',
                        },
                  });
                  await this.role.create({
                        data: {
                              name: 'user',
                        },
                  });
            }

            const admin = await this.user.findFirst({
                  where: {
                        login: 'adm@gmail.com',
                  },
            });

            if (!admin) {
                  await this.user.create({
                        data: {
                              name: 'Admin',
                              login: 'adm@gmail.com',
                              //password: '6eT68&awa*d{',
                              password: '123456',
                              isAdm: true,
                              roleId: 1,
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
