import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
      IsString,
      IsNotEmpty,
      Length,
      ValidateNested,
      IsArray,
      IsOptional,
} from 'class-validator';
import { CreateLoanDto } from '../loan/create-loan.dto';
import { ApiProperty } from '@nestjs/swagger';
import { CreateAddressDto } from '../address/create-address.dto';

export class CreateClientDto {
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

      @IsString()
      @ApiProperty()
      @IsOptional()
      attendant?: string;

      @IsString()
      @ApiProperty()
      @IsOptional()
      observation?: string;

      @ApiProperty()
      @ValidateNested()
      @Type(() => CreateAddressDto)
      address: CreateAddressDto;

      @ValidateNested()
      @Type(() => CreateLoanDto)
      loan: CreateLoanDto[];
}
