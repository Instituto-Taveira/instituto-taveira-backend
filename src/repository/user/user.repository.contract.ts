import { CreateUserDTO } from 'src/dto/user/createUser.dto';
import { User } from '../../entities/user.entity';

export default interface IUserRepository {
      findByLogin(login: string): Promise<User>;
      create(data: CreateUserDTO): Promise<User>;
      findAll(): Promise<User[]>;
}
