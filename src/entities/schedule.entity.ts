import { v4 as uuid } from 'uuid';

export class Schedule {
      id: string;
      clientId: string;
      date: Date;
      value: number;
      send: boolean;
      value_sent: number;
      interest_rate: number;
      format_instalment: number;
      paymentIds: string;
      loanIds: string;
      createdAt: Date;
      updatedAt?: Date | null;

      constructor(props: Omit<Schedule, 'id' | 'createdAt'>, id?: string) {
            Object.assign(this, props);
            this.id = id ?? uuid();
      }
}
