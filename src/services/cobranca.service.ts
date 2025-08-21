import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/config/database/prisma.service';
import PagamentoService from './pagamento.service';
import { ICobrancaRepository } from 'src/repository/cobranca/cobranca.repository.contract';

@Injectable()
export class CobrancaService {
  private readonly logger = new Logger(CobrancaService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(ICobrancaRepository)
    private cobrancaRepository: ICobrancaRepository,
    @Inject(forwardRef(() => PagamentoService))
    private pagamentoService: PagamentoService
  ) { }

  async createCobranca(data: any, paymentId: number) {

    try {

      console.log(data);

      const payment = await this.pagamentoService.createManual(
        data,
      );

      return await this.cobrancaRepository.create(data, payment.id);

    } catch (error) {
      console.log(error);
      throw new Error('Erro ao criar cobrança');
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  //@Cron('*/20 * * * * *') // para testar a cada 20 segundos
  async processarCobrancas() {
    this.logger.log('Iniciando verificação de cobranças...');

    const hoje = new Date();
    const diaAtual = hoje.getDate();
    const dataEsperada = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      20,
      0,
    );

    const cobrancas = await this.prisma.cobranca.findFirst({
      include: { payment: true },
      where: {
        createdAt: {
          gte: new Date(
            hoje.getFullYear(),
            hoje.getMonth(),
            1,
          ), // primeiro dia do mês
          lt: new Date(
            hoje.getFullYear(),
            hoje.getMonth() + 1,
            1,
          ), // primeiro dia do próximo mês
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (diaAtual < 19) {
      this.logger.log('Ainda não é dia 20, não há cobranças a serem processadas.');
      return;
    }

    if (!cobrancas) {
      const pagamento = await this.pagamentoService.create();

      await this.cobrancaRepository.create(
        {
          period: 'mensal',
          billingDate: new Date(
            hoje.getFullYear(),
            hoje.getMonth(),
            20,
          ),
          startDate: new Date(
            hoje.getFullYear(),
            hoje.getMonth(),
            20,
          ),
          endDate: new Date(
            hoje.getFullYear(),
            hoje.getMonth() + 1,
            19,
          ),
        },
        pagamento.id,
      );

      this.logger.log(
        `Cobrança criada para ${dataEsperada.toLocaleDateString()}`,
      );
      return;
    }

    if (
      cobrancas.billingDate > hoje &&
      cobrancas.payment.status === 'PAID'
    ) {
      this.logger.log('Assinatura ainda não venceu');
      return;
    }

    if (cobrancas.endDate <= hoje) {
      this.logger.log('Assinatura vencida, criando nova cobrança');
      const pagamento = await this.pagamentoService.create();

      await this.cobrancaRepository.create(
        {
          period: 'mensal',
          billingDate: new Date(
            hoje.getFullYear(),
            hoje.getMonth(),
            20,
          ),
          startDate: new Date(
            hoje.getFullYear(),
            hoje.getMonth(),
            20,
          ),
          endDate: new Date(
            hoje.getFullYear(),
            hoje.getMonth() + 1,
            19,
          ),
        },
        pagamento.id,
      );
    }

    return;
  }

  async getAll() {
    return await this.cobrancaRepository.listAll();
  }
}
