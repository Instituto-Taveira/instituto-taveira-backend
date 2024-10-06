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
                        isBlocked: data.isBlocked,
                        isAdm: data.isAdm,
                  },
            });
      }

      async findByLogin(login: string): Promise<User> {
            return await this.repository.user.findUnique({
                  where: { login },
            });
      }

      async findAll(): Promise<User[]> {
            return await this.repository.user.findMany();
      }
}
