import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientModule } from './client.module';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';
import { AddressModule } from './address.module';
import { LoanModule } from './loan.module';
import { RepositoryModule } from './repository.module';
import { UserModule } from './user.module';
import { AuthModule } from './auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../config/authentication/guards/jwtAuth.guard';
import { PaymentModule } from './payment.module';
import { IterestDelayModule } from './iterestDelay.module';
import { FinanceModule } from './finance.module';

@Module({
      imports: [
            ConfigModule.forRoot({ envFilePath: '.env' }),
            ClientModule,
            AddressModule,
            LoanModule,
            RepositoryModule,
            UserModule,
            PaymentModule,
            AuthModule,
            IterestDelayModule,
            FinanceModule,
      ],
      controllers: [AppController],
      providers: [
            AppService,
            {
                  provide: APP_GUARD,
                  useClass: JwtAuthGuard,
            },
      ],
})
export class AppModule {}
