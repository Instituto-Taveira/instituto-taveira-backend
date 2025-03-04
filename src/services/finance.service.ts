import { Inject, Injectable } from '@nestjs/common';
import IFinanceRepository from 'src/repository/finance/finance.repository.contract';

@Injectable()
export class FinanceService {
      constructor(
            @Inject('IFinanceRepository')
            private readonly financeRepository: IFinanceRepository,
      ) {}

      async getFinanceSummary() {
            const totalLoaned = await this.financeRepository.getTotalLoaned();
            const totalInterest =
                  await this.financeRepository.getTotalInterest();
            const openLoansCount =
                  await this.financeRepository.getOpenLoansCount();
            const newLoansThisMonth =
                  await this.financeRepository.getNewLoansThisMonth();
            const totalNewLoansIn2024 =
                  await this.financeRepository.getTotalNewLoansIn2024();
            const totalReceivedInEachMonth =
                  await this.financeRepository.getTotalReceivedInEachMonth();
            const totalInterestReceivedInEachMonth =
                  await this.financeRepository.getTotalInterestReceivedInEachMonth();
            const getTotalLoanOpen =
                  await this.financeRepository.getStatistics();
            const getMoneyToReceive =
                  await this.financeRepository.getMoneyToReceive();
            const getSummaryToReceive =
                  await this.financeRepository.getSummaryToReceive();
            const getDetailsClients =
                  await this.financeRepository.getDetailsClients();

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
