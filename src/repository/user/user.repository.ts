import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/prisma.service';
import { CreateUserDTO } from 'src/dto/user/createUser.dto';
import { User } from 'src/entities/user.entity';
import IUserRepository from './user.repository.contract';

@Injectable()
export class UserRepository implements IUserRepository {
      constructor(private readonly repository: PrismaService) { }

      async create(data: User): Promise<User> {
            const createdUser = await this.repository.user.create({
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

      async update(id: number, data: CreateUserDTO): Promise<User> {
            const updatedUser = await this.repository.user.update({
                  where: { id },
                  data: {
                        name: data.name,
                        login: data.login,
                  },
                  include: {
                        role: true,
                  },
            });

            // Map Prisma user to your User entity if needed
            return {
                  ...updatedUser,
                  role: updatedUser.role,
            } as User;
      }

      async findById(id: number): Promise<User> {
            return await this.repository.user.findUnique({
                  where: { id },
                  include: {
                        role: true,
                  },
            });
      }

      async delete(id: number): Promise<void> {
            await this.repository.user.delete({
                  where: { id },
            });
      }

      async updatePassword(
            id: number,
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
                  include: {
                        role: true,
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
