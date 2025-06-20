import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/prisma.service';
import { CreateUserDTO } from 'src/dto/user/createUser.dto';
import { User } from 'src/entities/user.entity';
import IUserRepository from './user.repository.contract';

@Injectable()
export class UserRepository implements IUserRepository {
      constructor(private readonly repository: PrismaService) { }

      async create(data: User): Promise<User> {
            const createdUser = await this.repository.usuario.create({
                  data: {
                        name: data.name,
                        login: data.login,
                        password: data.password,
                        role: {
                              connect: {
                                    id: data.role.id,
                              },
                        },
                        firstLogin: data.firstLogin,
                        isBlocked: data.isBlocked,
                        isAdm: data.role.name === 'admin',
                  },
                  include: {
                        role: true,
                  },
            });

            return {
                  ...createdUser,
                  role: createdUser.role,
            } as User;
      }

      async findByLogin(login: string): Promise<User> {
            return await this.repository.usuario.findUnique({
                  where: { login },
                  include: {
                        role: true,
                  },
            });
      }

      async findAll(): Promise<Partial<User>[]> {
            return await this.repository.usuario.findMany({
                  select: {
                        id: true,
                        name: true,
                        firstLogin: true,
                        isAdm: true,
                        isBlocked: true,
                        login: true,
                        createdAt: true,
                        updatedAt: true,
                        role: true,
                  },
                  orderBy: {
                        isAdm: 'desc',
                  },
            });
      }

      async update(id: number, data: CreateUserDTO): Promise<User> {

            const role = await this.repository.role.findFirst({
                  where: {
                        name: data.role,
                  },
                  select: {
                        id: true,
                  }
            })

            await this.repository.usuario.update({
                  where: { id },
                  data: {
                        name: data.name,
                        login: data.login,
                        roleId: role.id,
                  }
            });

            return undefined;
      }

      async findById(id: number): Promise<User> {
            return await this.repository.usuario.findUnique({
                  where: { id },
                  include: {
                        role: true,
                  },
            });
      }

      async delete(id: number): Promise<void> {
            await this.repository.titular.delete({
                  where: { id },
            });
      }

      async updatePassword(
            id: number,
            password: string,
            firstLogin: boolean,
      ): Promise<User> {
            return await this.repository.usuario.update({
                  where: { id },
                  data: {
                        password,
                        firstLogin,
                        updatedAt: new Date(),
                  },
                  include: {
                        role: true,
                  },
            });
      }

      async findAllAttendants(): Promise<Partial<User>[]> {
            return await this.repository.usuario.findMany({
                  where: {
                        isAdm: false,
                  },
                  select: {
                        id: true,
                        name: true,
                  },
            });
      }

      async findRoles(name: string) {
            return await this.repository.role.findFirst({
                  where: { name },
            });
      }
}
