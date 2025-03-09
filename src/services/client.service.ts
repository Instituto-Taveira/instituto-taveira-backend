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
import { GenerateReportLoanClientDto } from 'src/dto/loan/generate-report-loan-client.dto';
import { AuthService } from './auth.service';
import { Console } from 'console';
import { GenerateReportInstalmentClosedDto } from 'src/dto/loan/generate-report-instalment-closed.dto';

@Injectable()
export class ClientService {
      constructor(
            @Inject('IClientRepository')
            private readonly clientRepository: IClientRepository,
            @Inject(forwardRef(() => LoanService))
            private readonly loanService: LoanService,
            private readonly authService: AuthService,
      ) {}

      async create(props: CreateClientDto, token: string): Promise<Client> {
            const tokenDecoded = await this.authService.decodeJWT(token);

            if (tokenDecoded.isAdm == false)
                  props.attendant = tokenDecoded.name;
            console.log(props);
            const address = new Address(props.address);
            const client = new Client(
                  { ...props },
                  address,
                  [],
                  tokenDecoded.isAdm,
            );
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
                              token,
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
            token: string,
            filters?: FiltersClientDTO,
      ): Promise<PageResponse<MappedClientDTO>> {
            const tokenDecoded = await this.authService.decodeJWT(token);

            if (tokenDecoded.isAdm == false)
                  filters.attendant = tokenDecoded.name;

            if (tokenDecoded.role == 'vendor') delete filters.attendant;
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
            const client: Client = await this.listById(id);

            if (data.approved === false) {
                  return await this.clientRepository.delete(client.id);
            }

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
            const response = clients
                  .map((client) => ({
                        ...client,
                        loan: client.loan
                              .map((loan) => {
                                    const loanStartDate = moment
                                          .utc(loan.startDate)
                                          .startOf('day')
                                          .toDate();
                                    const loanDueDate = moment
                                          .utc(loan.dueDate)
                                          .startOf('day')
                                          .toDate();
                                    const today = moment
                                          .utc()
                                          .subtract(4, 'hours')
                                          .startOf('day')
                                          .toDate();
                                    let withinDateRange = false;

                                    let statusMatch = false;
                                    let filteredPayments = [];
                                    switch (payload.status) {
                                          case 'Pago':
                                                statusMatch =
                                                      loan.payment_settled;
                                                withinDateRange =
                                                      loanStartDate >=
                                                            initial &&
                                                      loanDueDate <= final;
                                                break;
                                          case 'Atrasado':
                                                loan.payment.forEach(
                                                      (payment) => {
                                                            const paymentDueDate =
                                                                  moment
                                                                        .utc(
                                                                              payment.dueDate,
                                                                        )
                                                                        .startOf(
                                                                              'day',
                                                                        )
                                                                        .toDate();

                                                            withinDateRange =
                                                                  paymentDueDate >=
                                                                        initial &&
                                                                  paymentDueDate <=
                                                                        final;

                                                            if (
                                                                  paymentDueDate <
                                                                        today &&
                                                                  !payment.settled &&
                                                                  withinDateRange
                                                            ) {
                                                                  filteredPayments.push(
                                                                        payment,
                                                                  );
                                                            }
                                                      },
                                                );
                                                statusMatch =
                                                      filteredPayments.length >
                                                      0;
                                                break;
                                          case 'Atrasado Detalhado':
                                                filteredPayments =
                                                      loan.payment.filter(
                                                            (payment) => {
                                                                  const paymentDueDate =
                                                                        moment
                                                                              .utc(
                                                                                    payment.dueDate,
                                                                              )
                                                                              .startOf(
                                                                                    'day',
                                                                              )
                                                                              .toDate();

                                                                  withinDateRange =
                                                                        paymentDueDate >=
                                                                              initial &&
                                                                        paymentDueDate <=
                                                                              final;

                                                                  return (
                                                                        paymentDueDate <
                                                                              today &&
                                                                        !payment.settled &&
                                                                        withinDateRange
                                                                  );
                                                            },
                                                      );
                                                statusMatch =
                                                      filteredPayments.length >
                                                      0;

                                                break;
                                          case 'Em Dia':
                                                statusMatch =
                                                      !loan.payment_settled &&
                                                      loanDueDate >= today;
                                                withinDateRange =
                                                      loanStartDate >=
                                                            initial &&
                                                      loanDueDate <= final;
                                                break;
                                    }
                                    return statusMatch
                                          ? {
                                                  ...loan,
                                                  payment:
                                                        filteredPayments.length >
                                                              0 &&
                                                        payload.status ===
                                                              'Atrasado'
                                                              ? filteredPayments
                                                              : loan.payment,
                                            }
                                          : null;
                              })
                              .filter((loan) => loan !== null),
                  }))
                  .filter((client) => client.loan.length > 0);
            let valueLoaned = 0;
            let valueToPay = 0;
            const reduce = response.reduce((acc, curr) => {
                  valueLoaned += curr.loan.reduce(
                        (acc, curr) => acc + curr.value_loan,
                        0,
                  );

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
                  totalClients: reduce.length,
                  initialDate: payload.initialDate,
                  finalDate: payload.finalDate,
                  status: payload.status,
                  valueLoaned,
                  valueToPay,
                  clients: reduce,
            };
      }

      async listAllNames() {
            const clients = await this.clientRepository.listAllClients();

            return clients.map((client) => ({
                  id: client.id,
                  name: client.name,
            }));
      }

      async reportClient(payload: GenerateReportLoanClientDto) {
            const client = await this.clientRepository.generateReportClient({
                  name: payload.name,
            });

            if (!client) {
                  throw new HttpException(
                        'Cliente não encontrado!',
                        HttpStatus.NOT_FOUND,
                  );
            }

            let valueLoaned = 0;
            let valueToPay = 0;
            let valueInterestOnly = 0;

            const loans = client.loan.map((loan) => {
                  valueLoaned += loan.value_loan;

                  if (loan.only_pay_interest) {
                        valueInterestOnly += loan.payment[0].valuePaid;

                        valueToPay += loan.payment[0].valuePaid;
                  } else {
                        valueToPay +=
                              (loan.value_loan * loan.interest_rate) / 100 +
                              loan.value_loan;
                  }

                  return loan;
            });

            return {
                  name: client.name,
                  attendant: client.attendant,
                  valueLoaned,
                  valueToPay,
                  valueInterestOnly,
                  loans: client.loan,
            };
      }

      async reportClosed(payload: GenerateReportInstalmentClosedDto) {
            const payments = await this.clientRepository.findAllPaymentClosed(
                  payload.dueDate,
            );
            const totalValuePaid = payments.reduce(
                  (acc, curr) => acc + curr.valuePaid,
                  0,
            );
            return {
                  total: payments.length,
                  totalValuePaid,
                  data: payload.dueDate,
                  payments: payments.map((payment) => ({
                        id: payment.id,
                        valuePaid: payment.valuePaid,
                        dueDate: payment.dueDate,
                        value_loan: payment.loan.value_loan,
                        value_start_date: payment.loan.startDate,
                        client_name: payment.loan.client.name,
                        updated_at: payment.updatedAt,
                  })),
            };
      }

      private toDTO(clients: Client[]): MappedClientDTO[] {
            return clients.map((client) => {
                  let loanOpen = 'Não';
                  let nextPayment = null;
                  let status = 'Em dia';
                  let total = 0;
                  let pagar = 0;
                  let hasLoanToApprove = 'Não tem';
                  let loanToApproveDate = null;
                  client.loan.forEach((item) => {
                        total = total + item.value_loan;
                  });

                  client.loan.forEach((loan) => {
                        if (loan.payment_settled === false) loanOpen = 'Sim';
                        if (!loan.approved) {
                              hasLoanToApprove = 'Pendente Aprovação';
                              loanToApproveDate = moment
                                    .utc(loan.startDate)
                                    .format('DD/MM/YYYY');
                        }

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
                        attendant: client.attendantUser?.name ?? '',
                        observation: client.observation ?? '',
                        approved: client.approved ? 'Sim' : 'Não',
                        hasLoanToApprove,
                        loanToApproveDate,
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
