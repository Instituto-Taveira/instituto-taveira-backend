import {
      Controller,
      Request,
      Post,
      UseGuards,
      Get,
      HttpCode,
      HttpStatus,
      Headers,
      Body,
} from '@nestjs/common';

import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../config/authentication/guards/localAuth.guard';
import { JwtAuthGuard } from '../config/authentication/guards/jwtAuth.guard';
import { IsPublic } from 'src/decorators/public.decorator';
import { AuthRequest } from 'src/dto/user/authRequest.dto';
import { UserToken } from 'src/dto/auth/userToken.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdatePasswordUserDTO } from 'src/dto/user/updatePasswordUser.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
      constructor(private authService: AuthService) {}

      @ApiOperation({
            summary: 'Login',
            description: 'Utilize este endpoint para realizar o login.',
      })
      @UseGuards(LocalAuthGuard)
      @Post('login')
      @HttpCode(HttpStatus.OK)
      @IsPublic()
      async login(@Request() req: AuthRequest) {
            return this.authService.login(req.user);
      }

      @ApiOperation({
            summary: 'Profile',
            description:
                  'Utilize este endpoint para obter o perfil do usuário.',
      })
      @UseGuards(JwtAuthGuard)
      @Get('profile')
      getProfile(@Request() req) {
            return req.user;
      }

      @ApiOperation({
            summary: 'Logout',
            description: 'Utilize este endpoint para realizar o logout.',
      })
      @IsPublic()
      @Post('/verify/token')
      async verify(@Body() payload: UserToken) {
            return this.authService.decodeJWT(payload.access_token);
      }

      @ApiOperation({
            summary: 'Atualizar a senha',
            description: 'Utilize este endpoint para atualizar a senha.',
      })
      @UseGuards(JwtAuthGuard)
      @Post('firstLogin')
      @HttpCode(HttpStatus.OK)
      async firstLogin(
            @Body() body: UpdatePasswordUserDTO,
            @Headers('authorization') token: string,
      ) {
            return await this.authService.updateUserPassword(
                  body.password,
                  token,
            );
      }
}
