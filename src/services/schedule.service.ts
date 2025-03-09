import { Inject, Injectable } from '@nestjs/common';
import { CreateScheduleDTO } from 'src/dto/schedule/CreateSchedule.dto';
import { ScheduleRepository } from 'src/repository/schedule/schedule.repository';
import { ClientService } from './client.service';
import { Schedule } from 'src/entities/schedule.entity';
import { LoanService } from './loan.service';

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
                  format_instalment: createScheduleDTO.format_instalment,
                  interest_rate: createScheduleDTO.interest_rate,
                  value: createScheduleDTO.value_loan,
                  updatedAt: null,
            });

            await this.scheduleRepository.create(schedule);

            return {
                  message: 'Schedule created successfully',
                  schedule,
            };
      }

      async findAll() {
            const schedules = await this.scheduleRepository.findAll();

            return schedules.map((schedule: any) => {
                  let amount_owed = 0;
                  if (schedule.client.loan) {
                        amount_owed = schedule.client.loan.reduce(
                              (acc: number, loan: any) => {
                                    return acc + loan.rest_loan;
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
                  return {
                        id: schedule.id,
                        clientId: schedule.clientId,
                        date: schedule.date,
                        format_instalment: schedule.format_instalment,
                        interest_rate: schedule.interest_rate,
                        value: schedule.value,
                        value_with_interest,
                        send: schedule.send,
                        client: schedule.client.name,
                        createdAt: schedule.createdAt,
                        updatedAt: schedule.updatedAt,
                        loan: schedule.client.loan!,
                        amount_owed,
                        value_to_loan,
                  };
            });
      }

      async findByClient(id: string) {
            return await this.scheduleRepository.findByClient(id);
      }

      async send(id: string, token: string) {
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
                  return acc + loan.rest_loan;
            }, 0);

            if (total_loan >= schedule.value) {
                  throw new Error(
                        'Valor do agendamento não é suficiente para fechar todos os empréstimos',
                  );
            }

            let paymentsIds = '';
            let loanIds = '';

            for (const loan of cliente.loan) {
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
