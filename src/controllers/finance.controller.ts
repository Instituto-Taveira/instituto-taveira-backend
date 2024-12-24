import { Controller, Get } from '@nestjs/common';
import { FinanceService } from 'src/services/finance.service';

@Controller('api/finance')
export class FinanceController {
      constructor(private readonly financeService: FinanceService) {}

      @Get('summary')
      async getFinanceSummary() {
            return await this.financeService.getFinanceSummary();
      }
}
