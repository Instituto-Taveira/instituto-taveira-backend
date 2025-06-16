
export class Role {
      id: number;
      name: string;
      createdAt: Date;
      updatedAt?: Date | null;

      constructor(props: Omit<Role, 'id' | 'createdAt'>, id?: number) {
            Object.assign(this, props);
            this.id = id;
      }
}
