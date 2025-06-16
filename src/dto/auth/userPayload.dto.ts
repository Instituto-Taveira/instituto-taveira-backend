import { ApiProperty } from '@nestjs/swagger';

export class UserPayload {
      @ApiProperty()
      id: number;
      @ApiProperty()
      login: string;
      @ApiProperty()
      name: string;
      @ApiProperty()
      isAdm: boolean;
      @ApiProperty()
      role?: string;
      @ApiProperty()
      firstLogin: boolean;
}
