import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/prisma.service';
import { CreateUserDTO } from 'src/dto/user/createUser.dto';
import { User } from 'src/entities/user.entity';
import IUserRepository from './user.repository.contract';

@Injectable()
export class UserRepository implements IUserRepository {
      constructor(private readonly repository: PrismaService) {}

      async create(data: User): Promise<User> {
            return await this.repository.user.create({
                  data: {
                        id: data.id,
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
            });
      }

      async findByLogin(login: string): Promise<User> {
            return await this.repository.user.findUnique({
                  where: { login },
                  include: {
                        role: true,
                  },
            });
      }

      async findAll(): Promise<Partial<User>[]> {
            return await this.repository.user.findMany({
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

      async update(id: string, data: CreateUserDTO): Promise<User> {
            return await this.repository.user.update({
                  where: { id },
                  data: {
                        name: data.name,
                        login: data.login,
                  },
            });
      }

      async findById(id: string): Promise<User> {
            return await this.repository.user.findUnique({
                  where: { id },
            });
      }

      async delete(id: string): Promise<void> {
            await this.repository.user.delete({
                  where: { id },
            });
      }

      async updatePassword(
            id: string,
            password: string,
            firstLogin: boolean,
      ): Promise<User> {
            return await this.repository.user.update({
                  where: { id },
                  data: {
                        password,
                        firstLogin,
                        updatedAt: new Date(),
                  },
            });
      }

      async findAllAttendants(): Promise<Partial<User>[]> {
            return await this.repository.user.findMany({
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
