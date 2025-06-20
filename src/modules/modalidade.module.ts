import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { ModalidadeRepository } from 'src/repository/modalidade/modalidade.repository';
import { ModalidadeService } from 'src/services/modalidade.service';
import { ModalidadeController } from 'src/controllers/modalidade.controller';

@Module({
      controllers: [ModalidadeController],
      imports: [forwardRef(() => AuthModule)],
      providers: [
            ModalidadeService,
            {
                  provide: 'IModalidadeRepository',
                  useClass: ModalidadeRepository,
            },
      ],
      exports: [ModalidadeService],
})
export class ModalidadeModule {}
