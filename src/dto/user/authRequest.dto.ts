import { User } from '../../entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class AuthRequest extends Request {
      @ApiProperty()
      user: User;
}
