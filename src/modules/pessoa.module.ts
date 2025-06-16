import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { PessoaRepository } from 'src/repository/pessoa/pessoa.repository';
import { PessoaController } from 'src/controllers/pessoa.controller';
import { PessoaService } from 'src/services/pessoa.service';

@Module({
      controllers: [PessoaController],
      imports: [forwardRef(() => AuthModule)],
      providers: [
            PessoaService,
            {
                  provide: 'IPessoaRepository',
                  useClass: PessoaRepository,
            },
      ],
      exports: [PessoaService],
})
export class PessoaModule {}
