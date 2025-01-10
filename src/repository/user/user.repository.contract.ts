import { CreateUserDTO } from 'src/dto/user/createUser.dto';
import { User } from '../../entities/user.entity';

export default interface IUserRepository {
      findByLogin(login: string): Promise<User>;
      create(data: User): Promise<User>;
      findAll(): Promise<Partial<User>[]>;
      findById(id: string): Promise<User>;
      update(id: string, data: CreateUserDTO): Promise<User>;
      delete(id: string): Promise<void>;
      updatePassword(
            id: string,
            password: string,
            firstLogin: boolean,
      ): Promise<User>;
      findAllAttendants(): Promise<Partial<User>[]>;
}
