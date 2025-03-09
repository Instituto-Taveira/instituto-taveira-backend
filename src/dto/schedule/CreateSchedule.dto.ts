import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsDate } from 'class-validator';
import { EFormatInstalment } from 'src/entities/loan.entity';

export class CreateScheduleDTO {
      clientID: string;
      @IsNumber()
      @ApiProperty()
      value_loan: number;

      @IsNumber()
      @ApiProperty()
      interest_rate: number;

      @IsEnum(EFormatInstalment)
      @ApiProperty()
      format_instalment: EFormatInstalment;

      @IsDate()
      @ApiProperty()
      start_date: Date;
}
