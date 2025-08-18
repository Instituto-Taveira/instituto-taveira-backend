import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/config/database/prisma.service';
import PagamentoService from './pagamento.service';
import { ICobrancaRepository } from 'src/repository/cobranca/cobranca.repository.contract';

@Injectable()
export class CobrancaService {
  private readonly logger = new Logger(CobrancaService.name);

  constructor(
    private prisma: PrismaService,
    private pagamentoService: PagamentoService,
    @Inject('ICobrancaRepository')
    private cobrancaRepository: ICobrancaRepository
  ) { }

  // roda todo dia à meia-noite
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processarCobrancas() {
    this.logger.log('Iniciando verificação de cobranças...');

    const hoje = new Date();
    const dia = hoje.getDate();
    const dataEsperada = new Date(hoje.getFullYear(), hoje.getMonth(), 18, 0);

    // se ainda não passou do dia 20, não faz nada
    if (dia < 17) {
      this.logger.log('Ainda não chegou o dia 20, nenhuma cobrança gerada.');
      return;
    }

    const cobrancas = await this.prisma.cobranca.findFirst({
      include: { payment: true },
      where: {
        createdAt: {
          gte: new Date(hoje.getFullYear(), hoje.getMonth(), 1),   // primeiro dia do mês
          lt: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1) // primeiro dia do próximo mês
        }
      }
    });

    if (!cobrancas) {
      const pagamento = await this.pagamentoService.create();

      await this.prisma.cobranca.create({
        data: {
          paymentId: pagamento.id,
          startDate: hoje,
          endDate: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 17),
          period: 'mensal',
          billingDate: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 18),
        }
      });

      this.logger.log(`Cobrança criada para ${dataEsperada.toLocaleDateString()}`);
    }

    return;

  }

  async getAll() {
    return await this.cobrancaRepository.listAll();
  }

}
