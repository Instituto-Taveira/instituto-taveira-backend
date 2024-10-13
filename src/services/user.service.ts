import { HttpException, Inject, Injectable } from '@nestjs/common';
import { CreateUserDTO } from 'src/dto/user/createUser.dto';
import { User } from 'src/entities/user.entity';
import IUserRepository from 'src/repository/user/user.repository.contract';

@Injectable()
export class UserService {
      constructor(
            @Inject('IUserRepository')
            private readonly userRepository: IUserRepository,
      ) {}

      async create(data: CreateUserDTO): Promise<User> {
            const existUser = await this.userRepository.findByLogin(data.login);

            if (existUser) {
                  throw new HttpException(
                        'Usuário com esse login já existe, escolha outro!',
                        400,
                  );
            }

            const user: User = new User({
                  name: data.name,
                  login: data.login,
                  isAdm: data.isAdm,
                  isBlocked: false,
                  updatedAt: new Date(),
                  password: '123456',
            });
            return await this.userRepository.create(user);
      }

      async findOne(login: string): Promise<User> {
            return await this.userRepository.findByLogin(login);
      }

      async findAll(): Promise<User[]> {
            return await this.userRepository.findAll();
      }

      async update(id: string, data: CreateUserDTO): Promise<void> {
            const user = await this.userRepository.findById(id);

            if (!user) {
                  throw new HttpException('Usuário não encontrado!', 404);
            }

            const existUser = await this.userRepository.findByLogin(data.login);

            if (existUser && existUser.id !== id) {
                  throw new HttpException(
                        'Usuário com esse login já existe, escolha outro!',
                        400,
                  );
            }

            await this.userRepository.update(id, data);

            return;
      }

      async delete(id: string): Promise<void> {
            const user = await this.userRepository.findById(id);

            if (!user) {
                  throw new HttpException('Usuário não encontrado!', 404);
            }

            await this.userRepository.delete(id);

            return;
      }
}
