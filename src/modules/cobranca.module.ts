import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { CobrancaService } from 'src/services/cobranca.service';
import { CobrancaRepository } from 'src/repository/cobranca/cobranca.repository';
import { CobrancaController } from 'src/controllers/cobranca.controller';
import PagamentoService from 'src/services/pagamento.service';
import { PagamentoModule } from './pagamento.module';

@Module({
    controllers: [CobrancaController],
    imports: [
        forwardRef(() => AuthModule),
        PagamentoModule
    ],
    providers: [
        PagamentoService,
        CobrancaService,
        {
            provide: 'ICobrancaRepository',
            useClass: CobrancaRepository,
        },
    ],
    exports: [CobrancaService],
})
export class CobrancaModule { }
