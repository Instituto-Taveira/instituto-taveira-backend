import { ApiProperty } from '@nestjs/swagger';

export class UpdateLoanApproved {
      @ApiProperty()
      approved: boolean;
}
