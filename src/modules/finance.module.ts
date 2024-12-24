import { Module } from '@nestjs/common';
import { FinanceController } from 'src/controllers/finance.controller';
import { FinanceRepository } from 'src/repository/finance/finance.repository';
import { FinanceService } from 'src/services/finance.service';

@Module({
      controllers: [FinanceController],
      providers: [
            FinanceService,
            {
                  provide: 'IFinanceRepository',
                  useClass: FinanceRepository,
            },
      ],
})
export class FinanceModule {}
