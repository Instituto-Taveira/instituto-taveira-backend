import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/entities/role.entity';

export class AuthUserDTO {
      @ApiProperty()
      id: string;
      @ApiProperty()
      name: string;
      @ApiProperty()
      login: string;
      @ApiProperty()
      isAdm: boolean;
      @ApiProperty()
      role: Role;
}
