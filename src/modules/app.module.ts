import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';
import { RepositoryModule } from './repository.module';
import { UserModule } from './user.module';
import { AuthModule } from './auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../config/authentication/guards/jwtAuth.guard';
import { PessoaModule } from './pessoa.module';
import { ModalidadeModule } from './modalidade.module';

@Module({
      imports: [
            ConfigModule.forRoot({ envFilePath: '.env' }),
            RepositoryModule,
            UserModule,
            AuthModule,
            PessoaModule,
            ModalidadeModule
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
