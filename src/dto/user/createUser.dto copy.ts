import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class CreateUserDTO {
      @ApiProperty()
      @IsString()
      name: string;

      @IsString()
      @ApiProperty()
      login: string;

      @IsBoolean()
      @ApiProperty()
      isAdm: boolean;
}
