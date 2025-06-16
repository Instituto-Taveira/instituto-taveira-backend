import {
      forwardRef,
      HttpException,
      HttpStatus,
      Inject,
      Injectable,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entities/user.entity';
import { UserPayload } from 'src/dto/auth/userPayload.dto';

@Injectable()
export class AuthService {
      constructor(
            @Inject(forwardRef(() => UserService))
            private userService: UserService,
            private jwtService: JwtService,
      ) {}

      async validateUser(loginUser: string, pass: string): Promise<User> {
            const user = await this.userService.findOne(loginUser);
            if (user && user.password === pass) {
                  const { password, ...users } = user;
                  return { ...users, password: undefined };
            }
            return null;
      }

      async login(user: User): Promise<any> {
            const payload: UserPayload = {
                  login: user.login,
                  id: user.id,
                  name: user.name,
                  role: user.role.name,
                  isAdm: user.isAdm,
                  firstLogin: user.firstLogin,
            };

            if (user.isBlocked) {
                  throw new HttpException(
                        'Usuário bloqueado!',
                        HttpStatus.FORBIDDEN,
                  );
            }

            return {
                  ...payload,
                  access_token: this.jwtService.sign(payload),
            };
      }

      async updateUserPassword(password: string, token: string): Promise<any> {
            const decodedToken = await this.decodeJWT(token);
            const user = await this.userService.findOne(decodedToken.login);
            if (!user) {
                  throw new HttpException('Usuário não encontrado!', 404);
            }

            const userUpdated = await this.userService.updateUserPassword(
                  user.id,
                  password,
            );

            const payload: UserPayload = {
                  login: userUpdated.login,
                  id: userUpdated.id,
                  name: userUpdated.name,
                  isAdm: userUpdated.isAdm,
                  firstLogin: userUpdated.firstLogin,
            };

            return {
                  ...payload,
                  access_token: this.jwtService.sign(payload),
            };
      }

      private verifyToken(token: string): any {
            try {
                  const decodedToken = this.jwtService.verify(token, {
                        secret: process.env.SECRET_KEY_ACCESS_TOKEN,
                  });

                  return decodedToken;
            } catch (e) {
                  throw new HttpException(
                        'Token invalid!',
                        HttpStatus.UNAUTHORIZED,
                  );
            }
      }

      private extractToken(tokenToExtract: string): string {
            const [, token] = tokenToExtract.split('Bearer ');
            return token;
      }

      async decodeJWT(token: string): Promise<any> {
            const tokenExtracted = this.extractToken(token);

            if (!tokenExtracted)
                  throw new HttpException(
                        'Token not provided!',
                        HttpStatus.UNAUTHORIZED,
                  );

            const decodedToken = await this.jwtService.decode(tokenExtracted);

            return decodedToken;
      }
}
