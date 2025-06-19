import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class CreateUserDTO {
      @ApiProperty()
      @IsString()
      name: string;

      @IsString()
      @ApiProperty()
      login: string;

      @IsString()
      @ApiProperty()
      password: string;

      @IsString()
      @ApiProperty()
      role: string;
}
