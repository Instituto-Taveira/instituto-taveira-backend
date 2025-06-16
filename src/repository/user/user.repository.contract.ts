import { CreateUserDTO } from 'src/dto/user/createUser.dto';
import { User } from '../../entities/user.entity';
import { Role } from '@prisma/client';

export default interface IUserRepository {
      findByLogin(login: string): Promise<User>;
      create(data: User): Promise<User>;
      findAll(): Promise<Partial<User>[]>;
      findById(id: number): Promise<User>;
      update(id: number, data: CreateUserDTO): Promise<User>;
      delete(id: number): Promise<void>;
      updatePassword(
            id: number,
            password: string,
            firstLogin: boolean,
      ): Promise<User>;
      findAllAttendants(): Promise<Partial<User>[]>;
      findRoles(name: string): Promise<Role>;
}
