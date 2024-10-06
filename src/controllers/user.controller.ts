import {
      Body,
      Controller,
      Get,
      HttpCode,
      HttpStatus,
      Param,
      Post,
      UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/config/authentication/guards/jwtAuth.guard';
import { IsPublic } from 'src/decorators/public.decorator';
import { CreateUserDTO } from 'src/dto/user/createUser.dto';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/services/user.service';

@ApiTags('User')
@Controller('api/user')
export class UserController {
      constructor(private readonly userService: UserService) {}

      @ApiOperation({
            summary: 'Criar Usuário',
            description:
                  'Utilize este endpoint para criar um novo usuário.',
      })
      @IsPublic()
      @Post()
      @HttpCode(HttpStatus.CREATED)
      create(@Body() payload: CreateUserDTO): Promise<User> {
            return this.userService.create(payload);
      }

      @ApiOperation({
            summary: 'Login',
            description:
                  'Utilize este endpoint para buscar um usuário pelo login.',
      })
      @Get(':login')
      @UseGuards(JwtAuthGuard)
      findOne(@Param('login') login: string) {
            return this.userService.findOne(login);
      }

      @ApiOperation({
            summary: 'Listar Usuários',
            description:
                  'Utilize este endpoint para listar todos os usuários cadastrados.',
      })
      @Get()
      @UseGuards(JwtAuthGuard)
      findAll() {
            return this.userService.findAll();
      }
}
