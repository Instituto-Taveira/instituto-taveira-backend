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

      @ApiProperty()
      @IsString()
      @MinLength(4)
      @MaxLength(20)
      @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
            message: 'password too weak',
      })
      password: string;

      @ApiProperty()
      isAdm: boolean;
}
