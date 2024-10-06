import { ApiProperty } from '@nestjs/swagger';
import {
      IsOptional,
      IsString,
      Matches,
      MaxLength,
      MinLength,
} from 'class-validator';

export class CreateUserDTO {
      @ApiProperty()
      @IsString()
      name: string;

      @IsString()
      @ApiProperty()
      login: string;
}
