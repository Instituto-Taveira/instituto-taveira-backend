/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import IFinanceRepository from 'src/repository/finance/finance.repository.contract';

@Injectable()
export class FinanceService {
      constructor(
            @Inject('IFinanceRepository')
            private readonly financeRepository: IFinanceRepository,
      ) {}

      async getFinanceSummary() {
            const [
                  totalLoaned,
                  totalInterest,
                  openLoansCount,
                  newLoansThisMonth,
                  totalNewLoansIn2024,
                  totalReceivedInEachMonth,
                  totalInterestReceivedInEachMonth,
                  getTotalLoanOpen,
                  getMoneyToReceive,
                  getSummaryToReceive,
                  getDetailsClients,
            ] = await Promise.all([
                  this.financeRepository.getTotalLoaned(),
                  this.financeRepository.getTotalInterest(),
                  this.financeRepository.getOpenLoansCount(),
                  this.financeRepository.getNewLoansThisMonth(),
                  this.financeRepository.getTotalNewLoansIn2024(),
                  this.financeRepository.getTotalReceivedInEachMonth(),
                  this.financeRepository.getTotalInterestReceivedInEachMonth(),
                  this.financeRepository.getStatistics(),
                  this.financeRepository.getMoneyToReceive(),
                  this.financeRepository.getSummaryToReceive(),
                  this.financeRepository.getDetailsClients(),
            ]);

            return {
                  totalLoaned,
                  totalInterest,
                  totalLoanOpen: getTotalLoanOpen.totalLoanOpen,
                  totalLoanClosed: getTotalLoanOpen.totalLoanClosed,
                  totalClients: getTotalLoanOpen.totalClients,
                  totalMoneyToReceive: getMoneyToReceive,
                  openLoansCount,
                  newLoansThisMonth,
                  totalNewLoansIn2024,
                  totalReceivedInEachMonth,
                  totalInterestReceivedInEachMonth,
                  totalMoneyWithoutInterest:
                        getSummaryToReceive.totalMoneyWithoutInterest,
                  totalInterestToReceive:
                        getSummaryToReceive.totalInterestToReceive,
                  totalMoneyToReceive2:
                        getSummaryToReceive.totalMoneyToReceive2,
                  totaoMoneyDifference:
                        getSummaryToReceive.totaoMoneyDifference,
                  totalClientsWithOpenLoans:
                        getDetailsClients.totalClientsWithOpenLoans,
                  totalClientsWithClosedLoans:
                        getDetailsClients.totalClientsWithClosedLoans,
            };
      }
}
