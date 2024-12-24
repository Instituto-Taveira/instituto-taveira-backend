export default interface IFinanceRepository {
      getTotalLoaned(): Promise<number>;
      getTotalInterest(): Promise<number>;
      getOpenLoansCount(): Promise<number>;
      getNewLoansThisMonth(): Promise<number>;
      getTotalNewLoansIn2024(): Promise<{ month: number; total: number }[]>;
      getTotalReceivedInEachMonth(): Promise<
            { month: number; total: number }[]
      >;
      getTotalInterestReceivedInEachMonth(): Promise<
            {
                  month: number;
                  totalReceived: number;
                  totalInterestReceived: number;
            }[]
      >;
      getStatistics(): Promise<{
            totalLoanOpen: number;
            totalLoanClosed: number;
            totalClients: number;
      }>;
      getMoneyToReceive(): Promise<number>;
      getSummaryToReceive(): Promise<{
            totalMoneyWithoutInterest: number;
            totalInterestToReceive: number;
            totalMoneyToReceive2: number;
            totaoMoneyDifference: number;
      }>;
}
