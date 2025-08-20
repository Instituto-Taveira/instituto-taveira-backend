import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { CobrancaService } from 'src/services/cobranca.service';
import { CobrancaRepository } from 'src/repository/cobranca/cobranca.repository';
import { CobrancaController } from 'src/controllers/cobranca.controller';
import PagamentoService from 'src/services/pagamento.service';
import { PagamentoModule } from './pagamento.module';
import { ICobrancaRepository } from 'src/repository/cobranca/cobranca.repository.contract';

@Module({
    controllers: [CobrancaController],
    imports: [
        forwardRef(() => AuthModule),
        forwardRef(() => PagamentoModule)
    ],
    providers: [
        CobrancaService,
        {
            provide: ICobrancaRepository,
            useClass: CobrancaRepository,
        },
    ],
    exports: [CobrancaService, ICobrancaRepository],
})
export class CobrancaModule { }
