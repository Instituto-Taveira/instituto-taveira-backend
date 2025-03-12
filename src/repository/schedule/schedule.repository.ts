import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/prisma.service';
import IScheduleRepository from './schedule.repository.contract';
import { Schedule } from 'src/entities/schedule.entity';

@Injectable()
export class ScheduleRepository implements IScheduleRepository {
      constructor(private readonly repository: PrismaService) {}

      async create(schedule: Schedule): Promise<void> {
            await this.repository.schedule.create({
                  data: {
                        id: schedule.id,
                        date: schedule.date,
                        format_instalment: schedule.format_instalment,
                        interest_rate: schedule.interest_rate,
                        value: schedule.value,
                        paymentIds: '',
                        loanIds: '',
                        send: false,
                        createdAt: new Date(),
                        updatedAt: null,
                        clientId: schedule.clientId,
                  },
            });
      }

      async findAll(): Promise<Schedule[]> {
            return await this.repository.schedule.findMany({
                  orderBy: {
                        date: 'asc',
                  },
                  include: {
                        client: {
                              include: {
                                    loan: {
                                          where: {
                                                payment_settled: false,
                                          },
                                    },
                              },
                        },
                  },
            });
      }

      async findByClient(id: string): Promise<any> {
            return await this.repository.client.findFirst({
                  where: {
                        id,
                  },
                  include: {
                        loan: {
                              where: {
                                    payment_settled: false,
                              },
                              include: {
                                    payment: true,
                              },
                        },
                  },
            });
      }

      async getScheduleById(id: string): Promise<Schedule> {
            return await this.repository.schedule.findUnique({
                  where: {
                        id,
                  },
            });
      }

      async updatePaymentSettled(id: string, value: number): Promise<void> {
            await this.repository.payment.update({
                  where: {
                        id,
                  },
                  data: {
                        valuePaid: value,
                        settled: true,
                        updatedAt: new Date(),
                  },
            });
      }

      async updateLoanSettled(id: string): Promise<void> {
            await this.repository.loan.update({
                  where: {
                        id,
                  },
                  data: {
                        rest_loan: 0,
                        payment_settled: true,
                        updatedAt: new Date(),
                  },
            });
      }

      async updateSchedule(
            id: string,
            paymentIds: string,
            loanIds: string,
            value_sent: number,
      ): Promise<void> {
            await this.repository.schedule.update({
                  where: {
                        id,
                  },
                  data: {
                        value_sent,
                        paymentIds,
                        loanIds,
                        send: true,
                        updatedAt: new Date(),
                  },
            });
      }
}
