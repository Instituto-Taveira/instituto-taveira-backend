import { Module } from '@nestjs/common';
import { ScheduleController } from 'src/controllers/schedule.controller';
import { ScheduleRepository } from 'src/repository/schedule/schedule.repository';
import { ScheduleService } from 'src/services/schedule.service';
import { ClientModule } from './client.module';
import { LoanModule } from './loan.module';

@Module({
      imports: [ClientModule, LoanModule],
      controllers: [ScheduleController],
      providers: [
            ScheduleService,
            { provide: 'IScheduleRepository', useClass: ScheduleRepository },
      ],
})
export class ScheduleModule {}
