import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdatePasswordUserDTO {
      @ApiProperty()
      @IsString()
      password: string;
}
