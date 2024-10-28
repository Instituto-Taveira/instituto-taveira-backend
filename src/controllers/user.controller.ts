import {
      Body,
      Controller,
      Delete,
      Get,
      HttpCode,
      HttpStatus,
      Param,
      Patch,
      Post,
      Headers,
      UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/config/authentication/guards/jwtAuth.guard';
import { IsPublic } from 'src/decorators/public.decorator';
import { CreateUserDTO } from 'src/dto/user/createUser.dto';
import { UpdatePasswordUserDTO } from 'src/dto/user/updatePasswordUser.dto';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/services/user.service';

@ApiTags('User')
@Controller('api/user')
export class UserController {
      constructor(private readonly userService: UserService) {}

      @ApiOperation({
            summary: 'Criar Usuário',
            description: 'Utilize este endpoint para criar um novo usuário.',
      })
      @Post()
      @UseGuards(JwtAuthGuard)
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

      @ApiOperation({
            summary: 'Atualizar Usuário',
            description:
                  'Utilize este endpoint para atualizar um usuário cadastrado.',
      })
      @Patch(':id')
      @UseGuards(JwtAuthGuard)
      async update(@Param('id') id: string, @Body() payload: CreateUserDTO) {
            await this.userService.update(id, payload);

            return { message: 'Usuário atualizado com sucesso!' };
      }

      @ApiOperation({
            summary: 'Atualizar senha padrão do usuário',
            description:
                  'Utilize este endpoint para atualizar a senha padrão do usuário.',
      })
      @Patch('/update-password/:id')
      @UseGuards(JwtAuthGuard)
      async updatePassword(@Param('id') id: string) {
            await this.userService.resetUserPassword(id);

            return { message: 'Usuário atualizado com sucesso!' };
      }

      @ApiOperation({
            summary: 'Deletar Usuário',
            description:
                  'Utilize este endpoint para deletar um usuário cadastrado.',
      })
      @Delete(':id')
      @UseGuards(JwtAuthGuard)
      async delete(@Param('id') id: string) {
            await this.userService.delete(id);

            return { message: 'Usuário deletado com sucesso!' };
      }
}
