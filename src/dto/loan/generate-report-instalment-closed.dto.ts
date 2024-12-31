import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsDateString, IsDefined } from 'class-validator';

export class GenerateReportInstalmentClosedDto {
      @IsDefined()
      @IsDateString()
      @ApiProperty()
      dueDate: Date;
}
