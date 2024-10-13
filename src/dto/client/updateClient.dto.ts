import { Transform, TransformFnParams } from 'class-transformer';
import {
      IsArray,
      IsBoolean,
      IsNotEmpty,
      IsOptional,
      IsString,
      Length,
} from 'class-validator';
import { UpdateAddressDto } from '../address/update-address.dto';
import { UpdateLoanDto } from '../loan/update-loan.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateClientDto {
      @ApiProperty()
      @IsString()
      @IsNotEmpty()
      @Length(3, 255)
      @Transform(({ value }: TransformFnParams) => value?.trim())
      name: string;

      @ApiProperty()
      @IsString()
      @IsNotEmpty()
      @Length(10, 1)
      @Transform(({ value }: TransformFnParams) => value?.trim())
      fone: string;

      @ApiProperty()
      address: UpdateAddressDto;

      @ApiProperty()
      @IsArray()
      loan: UpdateLoanDto[];

      @ApiProperty()
      @IsString()
      @IsOptional()
      attendant: string;

      @ApiProperty()
      @IsString()
      @IsOptional()
      observation: string;

      @ApiProperty()
      @IsBoolean()
      @IsOptional()
      approved: boolean;
}
