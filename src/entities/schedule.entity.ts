import { v4 as uuid } from 'uuid';
import { Loan } from './loan.entity';

export class Schedule {
      id: string;
      clientId: string;
      date: Date;
      value: number;
      send: boolean;
      canceled: boolean;
      value_sent: number;
      loan_to_settle: Loan[];
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
