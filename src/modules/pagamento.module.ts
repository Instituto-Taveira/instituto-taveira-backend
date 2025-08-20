import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { PagamentoController } from 'src/controllers/pagamento.controller';
import PagamentoService from 'src/services/pagamento.service';
import { PagamentoRepository } from 'src/repository/pagamento/pagamento.repository';
import { IPagamentoRepository } from 'src/repository/pagamento/pagamento.repository.contract';
import { CobrancaModule } from './cobranca.module';

@Module({
    controllers: [PagamentoController],
    imports: [forwardRef(() => AuthModule),
    forwardRef(() => CobrancaModule)
    ],
    providers: [
        PagamentoService,
        {
            provide: IPagamentoRepository,
            useClass: PagamentoRepository,
        },
    ],
    exports: [PagamentoService, IPagamentoRepository],
})
export class PagamentoModule { }
