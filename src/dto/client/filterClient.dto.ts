import { IsOptional } from 'class-validator';
import { Address } from '../../entities/address.entity';
import { Loan } from '../../entities/loan.entity';
import { ApiProperty } from '@nestjs/swagger';

export class FiltersClientDTO {
      @ApiProperty()
      @IsOptional()
      id?: string;

      @IsOptional()
      @ApiProperty()
      name?: string;

      @IsOptional()
      @ApiProperty()
      attendant?: string;

      @IsOptional()
      @ApiProperty()
      fone?: string;

      @ApiProperty()
      @IsOptional()
      address?: Address;

      @ApiProperty()
      @IsOptional()
      loan?: Loan[];
}
