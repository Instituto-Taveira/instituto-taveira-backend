import { v4 as uuid } from 'uuid';
import { User } from './user.entity';

export class Role {
      id: string;
      name: string;
      createdAt: Date;
      updatedAt?: Date | null;

      constructor(props: Omit<Role, 'id' | 'createdAt'>, id?: string) {
            Object.assign(this, props);
            this.id = id ?? uuid();
      }
}
