import { HttpCode, HttpException, Inject, Injectable } from '@nestjs/common';
import { CreateScheduleDTO } from 'src/dto/schedule/CreateSchedule.dto';
import { ScheduleRepository } from 'src/repository/schedule/schedule.repository';
import { ClientService } from './client.service';
import { Schedule } from 'src/entities/schedule.entity';
import { LoanService } from './loan.service';
import * as moment from 'moment';
import { SendScheduleDTO } from 'src/dto/schedule/SendSchedule.dto';

@Injectable()
export class ScheduleService {
      constructor(
            @Inject('IScheduleRepository')
            private readonly scheduleRepository: ScheduleRepository,
            private readonly clientService: ClientService,
            private readonly loanService: LoanService,
      ) {}

      async create(createScheduleDTO: CreateScheduleDTO) {
            const cliente = await this.clientService.findClienteForSchedule(
                  createScheduleDTO.clientID,
            );

            if (!cliente) {
                  throw new Error('Client not found');
            }
            const schedule = new Schedule({
                  date: new Date(createScheduleDTO.start_date),
                  clientId: createScheduleDTO.clientID,
                  send: false,
                  paymentIds: '',
                  loanIds: '',
                  canceled: false,
                  value_sent: 0,
                  loan_to_settle: [],
                  format_instalment: createScheduleDTO.format_instalment,
                  interest_rate: createScheduleDTO.interest_rate,
                  value: createScheduleDTO.value_loan,
                  updatedAt: null,
            });

            await this.scheduleRepository.create(
                  schedule,
                  createScheduleDTO.loan_to_settle,
            );

            return {
                  message: 'Schedule created successfully',
                  schedule,
            };
      }

      async findAll() {
            const schedules = await this.scheduleRepository.findAll();

            schedules.sort((a: any, b: any) => {
                  if (a.send && !b.send) return 1;
                  if (!a.send && b.send) return -1;
                  if (a.date > b.date) return 1;
                  if (a.date < b.date) return -1;
                  if (a.canceled && !b.canceled) return 1;
                  if (!a.canceled && b.canceled) return -1;
                  return 0;
            });

            const now = moment.utc().subtract(4, 'hours').startOf('day');
            const tomorrow = now.clone().add(1, 'days');
            const threeDaysLater = now.clone().add(3, 'days');
            return schedules.map((schedule: any) => {
                  let amount_owed = 0;
                  let interest_delay = 0;
                  if (schedule.loan_to_settle) {
                        amount_owed = schedule.loan_to_settle.reduce(
                              (acc: number, loan: any) => {
                                    return acc + loan.rest_loan;
                              },
                              0,
                        );

                        interest_delay = schedule.loan_to_settle.reduce(
                              (acc, loan) => {
                                    let totalMoraSum = 0;

                                    loan.payment.forEach((payment) => {
                                          if (
                                                payment.iterestDelay &&
                                                payment.iterestDelay.payDay &&
                                                payment.dueDate
                                          ) {
                                                if (
                                                      !payment.iterestDelay
                                                            .settled
                                                ) {
                                                      const payDay = new Date(
                                                            payment.iterestDelay.payDay,
                                                      );
                                                      const dueDate = new Date(
                                                            payment.dueDate,
                                                      );

                                                      const timeDiff = Math.abs(
                                                            payDay.getTime() -
                                                                  dueDate.getTime(),
                                                      );
                                                      const differenceInDays =
                                                            Math.ceil(
                                                                  timeDiff /
                                                                        (1000 *
                                                                              3600 *
                                                                              24),
                                                            );

                                                      const result =
                                                            differenceInDays *
                                                            payment.iterestDelay
                                                                  .value;
                                                      payment.iterestDelay.days =
                                                            differenceInDays;
                                                      payment.iterestDelay.totalMora =
                                                            result;

                                                      totalMoraSum += result;
                                                }
                                          }
                                    });

                                    return acc + totalMoraSum;
                              },
                              0,
                        );
                  }

                  let value_to_loan = schedule.send
                        ? 0
                        : schedule.value - amount_owed;
                  let value_with_interest =
                        schedule.value +
                        (schedule.value * schedule.interest_rate) / 100;

                  let status = 'Cancelado';
                  if (!schedule.canceled) {
                        status = 'Pendente';
                        const dueDate = moment
                              .utc(schedule.date)
                              .startOf('day');
                        if (dueDate.isSame(now, 'day')) status = 'Hoje';
                        else if (dueDate.isSame(tomorrow, 'day'))
                              status = 'Amanhã';
                        else if (dueDate.isBetween(now, tomorrow, 'day', '[]'))
                              status = 'Em 2 dias';
                        else if (
                              dueDate.isBetween(
                                    now,
                                    threeDaysLater,
                                    'day',
                                    '[]',
                              )
                        )
                              status = 'Em 3 dias';
                        if (schedule.send) {
                              status = 'Enviado';
                              amount_owed = 0;
                              value_to_loan = 0;
                        }
                  }

                  return {
                        id: schedule.id,
                        clientId: schedule.clientId,
                        date: schedule.date,
                        format_instalment: schedule.format_instalment,
                        interest_rate: schedule.interest_rate,
                        value: schedule.value,
                        value_with_interest,
                        value_sent: schedule.value_sent,
                        send: schedule.send ? 'Sim' : 'Não',
                        client: schedule.client.name,
                        createdAt: schedule.createdAt,
                        updatedAt: schedule.updatedAt,
                        loan: schedule.loan_to_settle!,
                        interest_delay,
                        amount_owed,
                        value_to_loan,
                        status,
                  };
            });
      }

      async findByClient(id: string) {
            return await this.scheduleRepository.findByClient(id);
      }

      async send(id: string, token: string, payload: SendScheduleDTO) {
            const schedule = await this.scheduleRepository.getScheduleById(id);

            if (!schedule) {
                  throw new Error('Agendamento não encontrado');
            }

            if (schedule.send) {
                  throw new Error('Agendamento já foi enviado');
            }

            const cliente = await this.clientService.findClienteForSchedule(
                  schedule.clientId,
            );

            console.log(cliente);

            const total_loan = cliente.loan.reduce((acc: number, loan: any) => {
                  if (payload.loan_ids.includes(loan.id))
                        return acc + loan.rest_loan;
                  return acc;
            }, 0);

            if (total_loan > schedule.value) {
                  throw new HttpException(
                        'Valor do agendamento não é suficiente para fechar todos os empréstimos',
                        400,
                  );
            }

            let paymentsIds = '';
            let loanIds = '';

            for (const loan of cliente.loan) {
                  if (payload.loan_ids.includes(loan.id)) {
                        if (loan.payment) {
                              for (const payment of loan.payment) {
                                    if (!payment.settled) {
                                          paymentsIds += `${payment.id},`;
                                          await this.updatePayment(
                                                payment.id,
                                                payment.value,
                                          );
                                    }
                              }
                        }
                        loanIds += `${loan.id},`;
                        await this.updateLoanSettled(loan.id);
                  }
            }

            await this.loanService.create(
                  {
                        format_instalment: schedule.format_instalment,
                        interest_rate: schedule.interest_rate,
                        start_date: schedule.date,
                        value_loan: schedule.value,
                  },
                  schedule.clientId,
                  token,
            );

            await this.scheduleRepository.updateSchedule(
                  schedule.id,
                  paymentsIds,
                  loanIds,
                  schedule.value - total_loan,
            );

            return {
                  message: 'Schedule sent successfully',
            };
      }

      async updatePayment(paymentId: string, value: number) {
            await this.scheduleRepository.updatePaymentSettled(
                  paymentId,
                  value,
            );
      }

      async updateLoanSettled(loanId: string) {
            await this.scheduleRepository.updateLoanSettled(loanId);
      }
}
