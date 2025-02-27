import { v4 as uuid } from 'uuid';
import { Role } from './role.entity';

export class User {
      id: string;
      name: string;
      login: string;
      password: string;
      isBlocked: boolean;
      isAdm: boolean;
      firstLogin: boolean;
      role?: Role;
      createdAt: Date;
      updatedAt?: Date | null;

      constructor(props: Omit<User, 'id' | 'createdAt'>, id?: string) {
            Object.assign(this, props);
            this.id = id ?? uuid();
      }
}
