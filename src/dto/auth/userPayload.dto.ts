import { ApiProperty } from '@nestjs/swagger';

export class UserPayload {
      @ApiProperty()
      id: string;
      @ApiProperty()
      login: string;
      @ApiProperty()
      name: string;
      @ApiProperty()
      isAdm: boolean;
      @ApiProperty()
      firstLogin: boolean;
}
