import { forwardRef, Module } from '@nestjs/common';
import { UserController } from 'src/controllers/user.controller';
import { UserRepository } from 'src/repository/user/user.repository';
import { UserService } from 'src/services/user.service';
import { AuthModule } from './auth.module';

@Module({
      controllers: [UserController],
      imports: [forwardRef(() => AuthModule)],
      providers: [
            UserService,
            {
                  provide: 'IUserRepository',
                  useClass: UserRepository,
            },
      ],
      exports: [UserService],
})
export class UserModule {}
