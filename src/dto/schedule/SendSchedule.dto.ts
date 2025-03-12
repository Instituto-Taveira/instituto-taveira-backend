import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsDate } from 'class-validator';
import { EFormatInstalment } from 'src/entities/loan.entity';

export class SendScheduleDTO {
      loan_ids: string[];
}
