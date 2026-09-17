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

            // papel do dono do sistema: acesso total, fica de fora da lista de
            // usuarios. Criado aqui de forma aberta (versionado, sem senha no
            // codigo); a conta em si e criada com credenciais fornecidas pelo
            // dono, nunca cravadas aqui.
            const owner = await this.role.findFirst({ where: { name: 'owner' } });
            if (!owner) {
                  await this.role.create({ data: { name: 'owner' } });
            }

            const admin = await this.usuario.findFirst({
                  where: {
                        login: 'adm@gmail.com',
                  },
            });

            if (!admin) {
                  await this.usuario.create({
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
