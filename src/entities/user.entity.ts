import { Role } from './role.entity';

export class User {
      id: number;
      name: string;
      login: string;
      password: string;
      isBlocked: boolean;
      isAdm: boolean;
      firstLogin: boolean;
      role: Role;
      createdAt: Date;
      updatedAt?: Date | null;

      constructor(props: Omit<User, 'id' | 'createdAt'>, id?: number) {
            Object.assign(this, props);
            this.id = id;
      }
}
