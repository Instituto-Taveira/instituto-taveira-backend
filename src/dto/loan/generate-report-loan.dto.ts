import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEAN, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { EFormatInstalment } from 'src/entities/loan.entity';
import { DueDateType } from 'src/utils/ETypes';

export class GenerateReportLoanDto {
      @IsNumber()
      @ApiProperty()
      attendant: string;

      @IsOptional()
      @ApiProperty()
      initialDate?: string;

      @IsOptional()
      @ApiProperty()
      finalDate?: string;

      @IsOptional()
      @ApiProperty()
      status: string;
}
