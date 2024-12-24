import { Module } from '@nestjs/common';
import { IterestDelayService } from 'src/services/iterestDelay.service';
import { IterestDelayRepository } from 'src/repository/iterestDelay/iterestDelay.repository';
import { IterestDelayController } from 'src/controllers/iterestDelay.controller ';

@Module({
      imports: [],
      providers: [
            IterestDelayService,
            {
                  provide: 'IIterestDelayRepository',
                  useClass: IterestDelayRepository,
            },
      ],
      controllers: [IterestDelayController],
      exports: [IterestDelayService],
})
export class IterestDelayModule {}
