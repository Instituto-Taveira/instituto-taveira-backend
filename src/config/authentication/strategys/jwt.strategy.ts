import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { AuthUserDTO } from 'src/dto/user/authUser.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
      constructor() {
            super({
                  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                  ignoreExpiration: false,
                  secretOrKey: 'SuperSecretJWTKey',
            });
      }

      async validate(payload: User): Promise<AuthUserDTO> {
            return {
                  id: payload.id,
                  name: payload.name,
                  isAdm: payload.isAdm,
                  login: payload.login,
                  role: payload.role,
            };
      }
}
