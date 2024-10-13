import { v4 as uuid } from 'uuid';
import { Address } from './address.entity';
import { Loan } from './loan.entity';

export class Client {
      id: string;
      name: string;
      fone: string;
      address: Address;
      attendant?: string;
      observation?: string;
      approved: boolean;
      loan: Loan[];
      createdAt?: Date;
      updatedAt?: Date | null;

      constructor(
            props: Omit<
                  Client,
                  'address' | 'id' | 'createdAt' | 'loan' | 'approved'
            >,
            address: Address,
            loan: Loan[],
            approved: boolean,
            id?: string,
      ) {
            Object.assign(this, props);
            this.id = id ?? uuid();
            (this.address = address),
                  (this.loan = loan),
                  (this.approved = approved);
      }
}
