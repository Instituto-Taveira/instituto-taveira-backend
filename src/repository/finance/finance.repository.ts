/* eslint-disable prettier/prettier */
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
            const endDate = new Date();
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 11); // Get last 12 months
            startDate.setDate(1); // Set to first day of the month
            startDate.setHours(0, 0, 0, 0);

            const loans = await this.repository.loan.findMany({
                  where: {
                        createdAt: {
                              gte: startDate,
                              lte: endDate,
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

            // Ensure we have entries for all 12 months, even if there are no loans
            const result = [];
            for (let i = 0; i < 12; i++) {
                  const date = new Date();
                  date.setMonth(date.getMonth() - i);
                  const month = date.getMonth() + 1;
                  result.unshift({
                        month,
                        total: monthlyLoanCounts[month] || 0,
                  });
            }

            return result;
      }

      async getTotalReceivedInEachMonth(): Promise<
            {
                  month: number;
                  totalReceived: number;
                  totalInterestReceived: number;
            }[]
      > {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const payments = await this.repository.payment.findMany({
                  where: {
                        valuePaid: {
                              gt: 0, // Only consider payments that have been paid
                        },
                        updatedAt: {
                              gte: sixMonthsAgo,
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
                  const year = payment.updatedAt.getFullYear();
                  const key = `${year}-${month}`;
                  if (!acc[key]) {
                        acc[key] = {
                              totalReceived: 0,
                              totalInterestReceived: 0,
                              year,
                              month,
                        };
                  }
                  acc[key].totalReceived += payment.valuePaid;
                  return acc;
            }, {} as Record<string, { totalReceived: number; totalInterestReceived: number; year: number; month: number }>);

            // Calculate interest for each month
            Object.values(monthlyReceivedAmounts).forEach((monthData) => {
                  payments.forEach((payment) => {
                        const paymentMonth = payment.updatedAt.getMonth() + 1;
                        const paymentYear = payment.updatedAt.getFullYear();

                        if (
                              paymentMonth === monthData.month &&
                              paymentYear === monthData.year
                        ) {
                              const loan = payment.loan;
                              const interestRate = loan.interest_rate;
                              const loanAmount = loan.value_loan;
                              const installments = loan.format_instalment;

                              if (interestRate > 0) {
                                    const totalLoanAmountWithInterest =
                                          loanAmount * (1 + interestRate / 100);
                                    const totalInterest =
                                          totalLoanAmountWithInterest -
                                          loanAmount;
                                    const interestPerInstallment =
                                          totalInterest / installments;
                                    monthData.totalInterestReceived +=
                                          interestPerInstallment;
                              }
                        }
                  });
            });

            // Convert to array and sort by year and month
            return Object.values(monthlyReceivedAmounts)
                  .sort((a, b) => {
                        if (a.year !== b.year) return a.year - b.year;
                        return a.month - b.month;
                  })
                  .map(({ month, totalReceived, totalInterestReceived }) => ({
                        month,
                        totalReceived: parseFloat(totalReceived.toFixed(2)),
                        totalInterestReceived: parseFloat(
                              totalInterestReceived.toFixed(2),
                        ),
                  }));
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
                                    : format_instalment ===
                                      EFormatInstalment.TWO_MONTHS
                                    ? 8
                                    : format_instalment ===
                                      EFormatInstalment.THREE_MONTHS
                                    ? 12
                                    : format_instalment ===
                                      EFormatInstalment.FOUR_MONTHS
                                    ? 16
                                    : format_instalment ===
                                      EFormatInstalment.FIVE_MONTHS
                                    ? 20
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
