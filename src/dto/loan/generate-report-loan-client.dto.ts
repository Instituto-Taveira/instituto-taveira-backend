import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEAN, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { EFormatInstalment } from 'src/entities/loan.entity';
import { DueDateType } from 'src/utils/ETypes';

export class GenerateReportLoanClientDto {
      @IsNumber()
      @ApiProperty()
      name: string;
}
