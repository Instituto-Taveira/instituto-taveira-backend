import { Injectable } from '@nestjs/common';
import { parse } from 'path';
import { PrismaService } from 'src/config/database/prisma.service';
import { EFormatInstalment } from 'src/entities/loan.entity';

@Injectable()
export class FinanceRepository {
      constructor(private readonly repository: PrismaService) {}

      async getTotalLoaned(): Promise<number> {
            const result = await this.repository.loan.aggregate({
                  _sum: {
                        value_loan: true,
                  },
            });

            return result._sum.value_loan || 0;
      }

      async getTotalToReceive(): Promise<number> {
            const result = await this.repository.payment.aggregate({
                  _sum: {
                        value: true,
                  },
            });

            return result._sum.value || 0;
      }

      async getTotalInterest(): Promise<number> {
            const loans = await this.repository.loan.findMany({
                  where: {
                        payment_settled: true,
                        only_pay_interest: false,
                        interest_rate: {
                              gt: 0,
                        },
                  },
                  select: {
                        value_loan: true,
                        interest_rate: true,
                  },
            });

            const totalInterest = loans.reduce((sum, loan) => {
                  const interest = (loan.value_loan * loan.interest_rate) / 100;
                  return sum + parseFloat(interest.toFixed(2));
            }, 0);

            return totalInterest;
      }

      async getOpenLoansCount(): Promise<number> {
            const count = await this.repository.loan.count({
                  where: {
                        payment_settled: false,
                  },
            });

            return count;
      }

      async getNewLoansThisMonth(): Promise<number> {
            const startOfMonth = new Date(
                  new Date().getFullYear(),
                  new Date().getMonth() - 2,
                  1,
            );
            const count = await this.repository.loan.count({
                  where: {
                        createdAt: {
                              gte: startOfMonth,
                        },
                  },
            });

            return count;
      }

      async getTotalNewLoansIn2024(): Promise<
            { month: number; total: number }[]
      > {
            const startOfYear = new Date(2024, 0, 1);
            const endOfYear = new Date(2024, 11, 31, 23, 59, 59);

            const loans = await this.repository.loan.findMany({
                  where: {
                        createdAt: {
                              gte: startOfYear,
                              lte: endOfYear,
                        },
                  },
                  select: {
                        createdAt: true,
                  },
            });

            const monthlyLoanCounts = loans.reduce((acc, loan) => {
                  const month = loan.createdAt.getMonth() + 1;
                  acc[month] = (acc[month] || 0) + 1;
                  return acc;
            }, {} as Record<number, number>);

            return Object.entries(monthlyLoanCounts).map(([month, total]) => ({
                  month: Number(month),
                  total,
            }));
      }

      async getTotalReceivedInEachMonth(): Promise<
            {
                  month: number;
                  totalReceived: number;
                  totalInterestReceived: number;
            }[]
      > {
            const payments = await this.repository.payment.findMany({
                  where: {
                        valuePaid: {
                              gt: 0, // Only consider payments that have been paid
                        },
                  },
                  select: {
                        valuePaid: true,
                        updatedAt: true,
                        loan: {
                              select: {
                                    interest_rate: true,
                                    value_loan: true,
                                    format_instalment: true,
                              },
                        },
                  },
            });

            const monthlyReceivedAmounts = payments.reduce((acc, payment) => {
                  const month = payment.updatedAt.getMonth() + 1;
                  acc[month] = (acc[month] || 0) + payment.valuePaid;
                  return acc;
            }, {} as Record<number, number>);

            return Object.entries(monthlyReceivedAmounts).map(
                  ([month, totalReceived]) => {
                        let totalInterestReceived = 0;

                        payments.forEach((payment) => {
                              const paymentMonth =
                                    payment.updatedAt.getMonth() + 1;
                              if (paymentMonth === Number(month)) {
                                    const loan = payment.loan;
                                    const interestRate = loan.interest_rate;
                                    const loanAmount = loan.value_loan;
                                    const installments = loan.format_instalment;

                                    if (interestRate > 0) {
                                          const totalLoanAmountWithInterest =
                                                loanAmount *
                                                (1 + interestRate / 100);
                                          const totalInterest =
                                                totalLoanAmountWithInterest -
                                                loanAmount;

                                          const interestPerInstallment =
                                                totalInterest / installments;
                                          totalInterestReceived +=
                                                interestPerInstallment;
                                    }
                              }
                        });

                        return {
                              month: Number(month),
                              totalReceived: parseFloat(
                                    totalReceived.toFixed(2),
                              ),
                              totalInterestReceived: parseFloat(
                                    totalInterestReceived.toFixed(2),
                              ),
                        };
                  },
            );
      }

      async getTotalInterestReceivedInEachMonth(): Promise<
            { month: number; totalInterest: number }[]
      > {
            const payments = await this.repository.payment.findMany({
                  where: {
                        settled: true,
                  },
                  select: {
                        value: true,
                        valuePaid: true,
                        createdAt: true,
                  },
            });

            const interestPerMonth = payments.reduce((acc, payment) => {
                  const month = new Date(payment.createdAt).getMonth() + 1;
                  const interestReceived = payment.valuePaid - payment.value;

                  if (!acc[month]) {
                        acc[month] = 0;
                  }
                  acc[month] += interestReceived;

                  return acc;
            }, {} as Record<number, number>);

            return Object.entries(interestPerMonth).map(
                  ([month, totalInterest]) => ({
                        month: Number(month),
                        totalInterest,
                  }),
            );
      }

      async getStatistics(): Promise<{
            totalLoanOpen: number;
            totalLoanClosed: number;
            totalClients: number;
      }> {
            const totalLoanOpen = await this.repository.loan.count({
                  where: {
                        payment_settled: false,
                  },
            });

            const totalLoanClosed = await this.repository.loan.count({
                  where: {
                        payment_settled: true,
                  },
            });

            const totalClients = await this.repository.client.count();

            return {
                  totalLoanOpen,
                  totalLoanClosed,
                  totalClients,
            };
      }

      async getMoneyToReceive(): Promise<number> {
            const result = await this.repository.payment.aggregate({
                  where: {
                        settled: false,
                  },
                  _sum: {
                        value: true,
                  },
            });

            const sum = result._sum.value || 0;

            return parseFloat(sum.toFixed(2));
      }

      async getSummaryToReceive(): Promise<{
            totalMoneyWithoutInterest: number;
            totalInterestToReceive: number;
            totalMoneyToReceive: number;
            totaoMoneyDifference: number;
      }> {
            const loans = await this.repository.loan.findMany({
                  where: {
                        payment_settled: false,
                  },
                  select: {
                        interest_rate: true,
                        value_loan: true,
                        format_instalment: true,
                        payment: {
                              select: {
                                    value: true,
                                    settled: true,
                              },
                        },
                  },
            });

            const totals = loans.reduce(
                  (acc, loan) => {
                        const {
                              interest_rate: interestRate,
                              value_loan: loanAmount,
                              format_instalment: format_instalment,
                              payment,
                        } = loan;

                        const installmentMultiplier =
                              format_instalment === EFormatInstalment.MONTHLY
                                    ? 1
                                    : format_instalment ===
                                      EFormatInstalment.BIWEEKLY
                                    ? 2
                                    : format_instalment ===
                                      EFormatInstalment.WEEKLY
                                    ? 4
                                    : 1;

                        if (interestRate > 0) {
                              const totalLoanAmountWithInterest =
                                    loanAmount * (1 + interestRate / 100);
                              const totalInterest =
                                    totalLoanAmountWithInterest - loanAmount;
                              const interestPerInstallment =
                                    totalInterest / installmentMultiplier;

                              const unsettledPayments = payment.filter(
                                    (p) => !p.settled,
                              );
                              const unsettledPaymentValues =
                                    unsettledPayments.reduce(
                                          (sum, p) => sum + p.value,
                                          0,
                                    );

                              acc.totalInterestToReceive +=
                                    interestPerInstallment *
                                    unsettledPayments.length;
                              acc.totalMoneyToReceive += unsettledPaymentValues;
                        } else {
                              acc.totalMoneyWithoutInterest += loanAmount;
                        }

                        return acc;
                  },
                  {
                        totalMoneyWithoutInterest: 0,
                        totalInterestToReceive: 0,
                        totalMoneyToReceive: 0,
                  },
            );

            const totaoMoneyDifference =
                  totals.totalMoneyToReceive -
                  totals.totalInterestToReceive +
                  totals.totalMoneyWithoutInterest;

            return {
                  totalMoneyWithoutInterest: totals.totalMoneyWithoutInterest,
                  totalInterestToReceive: totals.totalInterestToReceive,
                  totalMoneyToReceive: totals.totalMoneyToReceive,
                  totaoMoneyDifference: totaoMoneyDifference,
            };
      }

      async getDetailsClients(): Promise<{
            totalClients: number;
            totalClientsWithOpenLoans: number;
            totalClientsWithClosedLoans: number;
      }> {
            const totalClients = await this.repository.client.count();

            const totalClientsWithOpenLoans =
                  await this.repository.client.count({
                        where: {
                              loan: {
                                    some: {
                                          payment_settled: false,
                                    },
                              },
                        },
                  });

            const totalClientsWithClosedLoans =
                  await this.repository.client.count({
                        where: {
                              loan: {
                                    none: {
                                          payment_settled: false,
                                    },
                              },
                        },
                  });

            return {
                  totalClients,
                  totalClientsWithOpenLoans,
                  totalClientsWithClosedLoans,
            };
      }
}
