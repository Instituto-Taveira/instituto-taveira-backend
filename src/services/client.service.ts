import {
      HttpException,
      HttpStatus,
      Inject,
      Injectable,
      forwardRef,
} from '@nestjs/common';
import { Page, PageResponse } from 'src/config/database/page.model';
import { FiltersClientDTO } from 'src/dto/client/filterClient.dto';
import { MappedClientDTO } from 'src/dto/client/mappedClient.dto';
import { Address } from 'src/entities/address.entity';
import { Client } from 'src/entities/client.entity';
import IClientRepository from 'src/repository/client/client.repository.contract';
import { CreateClientDto } from '../dto/client/createClient.dto';
import { UpdateClientDto } from '../dto/client/updateClient.dto';
import * as moment from 'moment';
import { LoanService } from './loan.service';
import { GenerateReportLoanDto } from 'src/dto/loan/generate-report-loan.dto';

@Injectable()
export class ClientService {
      constructor(
            @Inject('IClientRepository')
            private readonly clientRepository: IClientRepository,
            @Inject(forwardRef(() => LoanService))
            private readonly loanService: LoanService,
      ) {}

      async create(props: CreateClientDto): Promise<Client> {
            const address = new Address(props.address);
            const client = new Client({ ...props }, address, []);
            const result = await this.clientRepository.create(client);

            if (props.loan.length > 0) {
                  props.loan.map(async (loans) => {
                        await this.loanService.create(
                              {
                                    value_loan: loans.value_loan,
                                    interest_rate: loans.interest_rate,
                                    format_instalment: loans.format_instalment,
                                    start_date: loans.start_date,
                              },
                              client.id,
                        );
                  });
            }

            return result;
      }

      async listAllTrue(
            page: Page,
            filters?: FiltersClientDTO,
      ): Promise<PageResponse<MappedClientDTO>> {
            const clients = await this.clientRepository.findAllPaymentTrue(
                  page,
                  filters,
            );

            if (clients.total === 0) {
                  throw new HttpException(
                        'Não existe resultado para essa pesquisa!',
                        HttpStatus.NOT_FOUND,
                  );
            }
            const items = this.toDTO(clients.items);

            items.map((client) => {
                  let total: number;

                  client.loan.forEach((item) => {
                        total = total + item.value_loan;
                  });
                  return { total, client };
            });

            return {
                  total: clients.total,
                  items,
            };
      }

      async listAllFalse(
            page: Page,
            filters?: FiltersClientDTO,
      ): Promise<PageResponse<MappedClientDTO>> {
            const clients = await this.clientRepository.findAllPaymentFalse(
                  page,
                  filters,
            );

            if (clients.total === 0) {
                  throw new HttpException(
                        'Não existe resultado para essa pesquisa!',
                        HttpStatus.NOT_FOUND,
                  );
            }

            const items = this.toDTO(clients.items);

            items.map((client) => {
                  let total: number;

                  client.loan.forEach((item) => {
                        total = total + item.value_loan;
                  });
                  return { total, client };
            });

            return {
                  total: clients.total,
                  items,
            };
      }

      async listAll(
            page: Page,
            filters?: FiltersClientDTO,
      ): Promise<PageResponse<MappedClientDTO>> {
            console.log(page);
            const clients = await this.clientRepository.findAll(page, filters);

            if (clients.total === 0) {
                  throw new HttpException(
                        'Não existe resultado para essa pesquisa!',
                        HttpStatus.NOT_FOUND,
                  );
            }
            const items = this.toDTO(clients.items);

            items.map((client) => {
                  let total: number;

                  client.loan.forEach((item) => {
                        total = total + item.value_loan;
                  });
                  return { total, client };
            });

            return {
                  total: clients.total,
                  items,
            };
      }

      async listById(id: string) {
            const client = await this.clientRepository.findById(id);

            if (!client)
                  throw new HttpException(
                        `Não foi encontrado um client com o id: ${id}`,
                        HttpStatus.NOT_FOUND,
                  );

            client.loan.forEach((loan) => {
                  let totalMoraSum = 0;

                  loan.payment.forEach((payment) => {
                        if (
                              payment.iterestDelay &&
                              payment.iterestDelay.payDay &&
                              payment.dueDate
                        ) {
                              const payDay = new Date(
                                    payment.iterestDelay.payDay,
                              );
                              const dueDate = new Date(payment.dueDate);

                              const timeDiff = Math.abs(
                                    payDay.getTime() - dueDate.getTime(),
                              );
                              const differenceInDays = Math.ceil(
                                    timeDiff / (1000 * 3600 * 24),
                              );

                              const result =
                                    differenceInDays *
                                    payment.iterestDelay.value;
                              payment.iterestDelay.days = differenceInDays;
                              payment.iterestDelay.totalMora = result;

                              // Acumular o total de mora
                              if (payment.iterestDelay.settled === false) {
                                    totalMoraSum += result;
                              }
                        }
                  });

                  // Adicionar totalMoraSum ao mesmo nível de cada objeto payment
                  loan.totalMoraSum = totalMoraSum;
            });

            return client;
      }

      async update(id: string, data: UpdateClientDto) {
            const client = await this.listById(id);

            return await this.clientRepository.update(
                  id,
                  Object.assign(client, { ...client, ...data }),
            );
      }

      async delete(id: string): Promise<Client> {
            const client = await this.listById(id);

            return await this.clientRepository.delete(client.id);
      }

      async report(payload: GenerateReportLoanDto) {
            console.log(payload);
            const initial = payload.initialDate
                  ? new Date(payload.initialDate)
                  : new Date(
                          new Date().setFullYear(new Date().getFullYear() - 50),
                    );

            const final = payload.finalDate
                  ? new Date(payload.finalDate)
                  : new Date(
                          new Date().setFullYear(new Date().getFullYear() + 50),
                    );
            const clients = await this.clientRepository.generateReport({
                  initialDate: initial.toISOString().split('T')[0],
                  finalDate: final.toISOString().split('T')[0],
                  status: payload.status,
                  attendant: payload.attendant,
            });

            console.log(initial, final);

            const response = clients
                  .filter((client) => client.attendant === payload.attendant)
                  .map((client) => ({
                        ...client,
                        loan: client.loan.filter((loan) => {
                              const loanStartDate = new Date(loan.startDate);
                              const loanDueDate = new Date(loan.dueDate);
                              const today = new Date();

                              // Check if the loan is within the date range
                              const withinDateRange =
                                    loanStartDate >= initial &&
                                    loanStartDate <= final;

                              // Handle status filtering
                              let statusMatch = false;

                              switch (payload.status) {
                                    case 'Pago':
                                          statusMatch = loan.payment_settled;
                                          break;
                                    case 'Atrasado':
                                          statusMatch =
                                                !loan.payment_settled &&
                                                loanDueDate < today;
                                          break;
                                    case 'Em dia':
                                          statusMatch =
                                                !loan.payment_settled &&
                                                loanDueDate >= today;
                                          break;
                                    case 'Vencer em 3 dias':
                                          const inThreeDays = new Date();
                                          inThreeDays.setDate(
                                                today.getDate() + 3,
                                          );
                                          statusMatch =
                                                !loan.payment_settled &&
                                                loanDueDate > today &&
                                                loanDueDate <= inThreeDays;
                                          break;
                              }

                              return withinDateRange && statusMatch;
                        }),
                  }))
                  .filter((client) => client.loan.length > 0);
            let valueLoaned = 0;
            let valueToPay = 0;
            const reduce = response.reduce((acc, curr) => {
                  valueLoaned += curr.loan.reduce(
                        (acc, curr) => acc + curr.value_loan,
                        0,
                  );

                  console.log(valueLoaned);
                  valueToPay += curr.loan.reduce(
                        (acc, curr) =>
                              acc +
                              (curr.value_loan * curr.interest_rate) / 100 +
                              curr.value_loan,
                        0,
                  );

                  acc.push({
                        name: curr.name,
                        loans: curr.loan,
                        total: curr.loan.reduce(
                              (acc, curr) => acc + curr.value_loan,
                              0,
                        ),
                        pagar: curr.loan.reduce(
                              (acc, curr) =>
                                    acc +
                                    (curr.value_loan * curr.interest_rate) /
                                          100 +
                                    curr.value_loan,
                              0,
                        ),
                  });
                  return acc;
            }, []);

            return {
                  attendant: payload.attendant,
                  initialDate: payload.initialDate,
                  finalDate: payload.finalDate,
                  status: payload.status,
                  valueLoaned,
                  valueToPay,
                  clients: reduce,
            };
      }

      private toDTO(clients: Client[]): MappedClientDTO[] {
            return clients.map((client) => {
                  let loanOpen = 'Não';
                  let nextPayment = null;
                  let status = 'Em dia';
                  let total = 0;
                  let pagar = 0;

                  client.loan.forEach((item) => {
                        total = total + item.value_loan;
                  });

                  client.loan.forEach((loan) => {
                        if (loan.payment_settled === false) loanOpen = 'Sim';
                        pagar = (total * loan.interest_rate) / 100 + total;

                        if (loan.payment_settled === false) {
                              loan.payment.forEach((payment) => {
                                    if (!payment.settled) {
                                          if (!nextPayment)
                                                nextPayment = payment;

                                          if (
                                                nextPayment.dueDate >
                                                payment.dueDate
                                          )
                                                nextPayment = payment;
                                    }
                              });
                        }
                  });

                  if (nextPayment) {
                        const dueDate = moment
                              .utc(nextPayment.dueDate)
                              .startOf('day');
                        const now = moment
                              .utc()
                              .subtract(4, 'hours')
                              .startOf('day');
                        const threeDaysLater = moment
                              .utc()
                              .add(3, 'days')
                              .startOf('day');
                        if (dueDate.isBefore(now, 'day')) {
                              status = 'Atrasado';
                        } else if (dueDate.isSame(now, 'day')) {
                              status = 'Hoje';
                        } else if (
                              dueDate.isBetween(
                                    now,
                                    threeDaysLater,
                                    'day',
                                    '[]',
                              )
                        ) {
                              status = 'Em 3 dias';
                        } else {
                              status = 'Em dia';
                        }
                  }

                  return {
                        id: client.id,
                        name: client.name,
                        fone: client.fone,
                        address: client.address,
                        attendant: client.attendant ?? '',
                        observation: client.observation ?? '',
                        loanOpen,
                        status,
                        nextPayment: nextPayment
                              ? {
                                      ...nextPayment,
                                      dueDate: moment(nextPayment.dueDate)
                                            .utc()
                                            .format('DD/MM/YYYY'),
                                }
                              : null,
                        loan: client.loan,
                        total,
                        pagar,
                        data: moment(client.createdAt).format('DD/MM/YYYY'),
                        dataFinal: moment(client.createdAt)
                              .add(1, 'month')
                              .format('DD/MM/YY'),
                  };
            });
      }
}
