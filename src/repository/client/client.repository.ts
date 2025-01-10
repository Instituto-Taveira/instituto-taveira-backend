import { Injectable } from '@nestjs/common';
import {
      generateQueryByFiltersForClient,
      generateQueryByFiltersForReport,
} from '../../config/database/Queries';
import { Page, PageResponse } from '../../config/database/page.model';
import { Pageable } from '../../config/database/pageable.service';
import { PrismaService } from '../../config/database/prisma.service';
import { FiltersClientDTO } from '../../dto/client/filterClient.dto';
import { Client } from '../../entities/client.entity';
import IClientRepository from './client.repository.contract';
import { Loan } from '../../entities/loan.entity';
import { UpdateClientDto } from '../../dto/client/updateClient.dto';
import { Client as PrismaClient, Prisma } from '@prisma/client';
import { GenerateReportLoanDto } from 'src/dto/loan/generate-report-loan.dto';
import { GenerateReportLoanClientDto } from 'src/dto/loan/generate-report-loan-client.dto';

@Injectable()
export class ClientRepository
      extends Pageable<Client>
      implements IClientRepository
{
      constructor(private readonly repository: PrismaService) {
            super();
      }
      async generateReportClient(
            data: GenerateReportLoanClientDto,
      ): Promise<any> {
            return await this.repository.client.findFirst({
                  where: {
                        name: {
                              contains: data.name,
                              mode: 'insensitive',
                        },
                  },
                  include: {
                        address: true,

                        loan: {
                              where: {
                                    approved: true,
                              },
                              include: {
                                    payment: true,
                              },
                        },
                  },
            });
      }

      async listAllClients(): Promise<Partial<Client>[]> {
            return await this.repository.client.findMany({
                  orderBy: {
                        name: 'asc',
                  },
            });
      }

      async findAllPaymentClosed(dueDate: Date): Promise<any> {
            const startOfDay = new Date(dueDate);
            startOfDay.setUTCHours(0, 0, 0, 0);

            const endOfDay = new Date(dueDate);
            endOfDay.setUTCHours(23, 59, 59, 999);

            console.log(startOfDay, endOfDay);

            const payment = await this.repository.payment.findMany({
                  where: {
                        updatedAt: {
                              gte: startOfDay,
                              lte: endOfDay,
                        },
                  },
                  orderBy: {
                        updatedAt: 'asc',
                  },
                  include: {
                        loan: {
                              include: {
                                    client: true,
                              },
                        },
                  },
            });

            return payment;
      }

      async findAll(page: Page, filters?: FiltersClientDTO): Promise<any> {
            const condition = generateQueryByFiltersForClient(filters);
            const items: any = condition
                  ? await this.repository.client.findMany({
                          ...this.buildPage(page),
                          where: { ...condition },
                          orderBy: {
                                approved: 'asc',
                          },
                          include: {
                                address: true,
                                attendantUser: true,
                                loan: {
                                      include: {
                                            payment: {
                                                  include: {
                                                        iterestDelay: true,
                                                  },
                                                  orderBy: {
                                                        dueDate: 'asc',
                                                  },
                                            },
                                      },
                                },
                          },
                    })
                  : await this.repository.client.findMany({
                          ...this.buildPage(page),

                          orderBy: {
                                createdAt: 'desc',
                          },
                          include: {
                                address: true,
                                attendantUser: true,
                                loan: {
                                      include: {
                                            payment: {
                                                  include: {
                                                        iterestDelay: true,
                                                  },
                                                  orderBy: {
                                                        dueDate: 'asc',
                                                  },
                                            },
                                      },
                                },
                          },
                    });

            const total = condition
                  ? await this.repository.client.count({
                          where: {
                                ...condition,
                          },
                    })
                  : await this.repository.client.count();
            return this.buildPageResponse(
                  items,
                  Array.isArray(total) ? total.length : total,
            );
      }
      findById(id: string): Promise<any> {
            return this.repository.client.findUnique({
                  where: { id },

                  include: {
                        address: true,
                        loan: {
                              include: {
                                    payment: {
                                          include: {
                                                iterestDelay: true,
                                          },
                                          orderBy: {
                                                dueDate: 'asc',
                                          },
                                    },
                              },
                              orderBy: {
                                    payment_settled: 'asc',
                              },
                        },
                  },
            });
      }
      // async findAll(
      //       page: Page,
      //       filters?: FiltersClientDTO,
      // ): Promise<PageResponse<Client>> {
      //       const condition = generateQueryByFiltersForClient(filters);

      //       const items = condition
      //             ? await this.repository.client.findMany({
      //                   ...this.buildPage(page),
      //                   where: condition,
      //                   include: {
      //                         address: true,
      //                         loan: true,
      //                   },
      //             })
      //             : await this.repository.client.findMany({
      //                   ...this.buildPage(page),
      //                   include: {
      //                         address: true,
      //                         loan: true,
      //                   },
      //             });

      //       const total = condition
      //             ? await this.repository.client.findMany({
      //                   where: {
      //                         ...condition,
      //                   },
      //             })
      //             : await this.repository.client.count();

      //       return this.buildPageResponse(
      //             items,
      //             Array.isArray(total) ? total.length : total,
      //       );
      // }

      // async findAll(
      //       page: Page,
      //       filters?: FiltersClientDTO,
      // ): Promise<PageResponse<Client>> {
      //       // Gera a cláusula WHERE da consulta com base nos filtros fornecidos
      //       const whereClause = generateQueryByFiltersForClient(filters);

      //       // Constrói a consulta com base na cláusula WHERE e nas opções de inclusão de dados
      //       const query = this.buildQuery({
      //             page,
      //             where: whereClause,
      //             include: {
      //                   address: true,
      //                   loan: true,
      //             },
      //       });

      //       // Executa a consulta para obter os itens e o total de itens
      //       const [items, total] = await Promise.all([
      //             this.repository.client.findMany(query),
      //             this.repository.client.count(whereClause),
      //       ]);

      //       // Constrói a resposta da página com base nos itens e no total de itens
      //       return this.buildPageResponse(items, Array.isArray(total) ? total.length : total);
      // }

      async generateReport(data: GenerateReportLoanDto): Promise<any[]> {
            const condition: any = generateQueryByFiltersForReport(data);
            return await this.repository.client.findMany({
                  where: condition,
                  include: {
                        loan: {
                              where: {
                                    approved: true,
                              },
                              include: {
                                    payment: true,
                              },
                              orderBy: {
                                    createdAt: 'desc',
                              },
                        },
                        address: true,
                  },
                  orderBy: {
                        name: 'asc',
                  },
            });
      }

      async findAllPaymentTrue(
            page: Page,
            filters?: FiltersClientDTO,
      ): Promise<PageResponse<Client>> {
            const condition = generateQueryByFiltersForClient(filters);

            const items = condition
                  ? await this.repository.client.findMany({
                          ...this.buildPage(page),

                          include: {
                                address: true,
                                loan: true,
                          },
                    })
                  : await this.repository.client.findMany({
                          ...this.buildPage(page),
                          where: {
                                ...condition,
                                loan: {
                                      some: {
                                            payment_settled: true,
                                      },
                                },
                          },
                          include: {
                                address: true,
                                loan: true,
                          },
                    });

            const total = condition
                  ? await this.repository.client.count(
                          {} as Prisma.ClientCountArgs,
                    )
                  : await this.repository.client.count();

            const clients: Client[] = items.map((item: Client) => {
                  // Faça a conversão de tipo de PrismaClient para Client
                  const { address, loan, ...rest } = item;
                  return {
                        ...rest,
                        address: address as any,
                        loan: loan as any,
                  } as Client;
            });

            return this.buildPageResponse(
                  clients,
                  Array.isArray(total) ? total.length : total,
            );
      }

      async findAllPaymentFalse(
            page: Page,
            filters?: FiltersClientDTO,
      ): Promise<PageResponse<Client>> {
            const condition = generateQueryByFiltersForClient(filters);

            const items = condition
                  ? await this.repository.client.findMany({
                          ...this.buildPage(page),

                          include: {
                                address: true,
                                loan: true,
                          },
                    })
                  : await this.repository.client.findMany({
                          ...this.buildPage(page),
                          where: {
                                ...condition,
                                loan: {
                                      some: {
                                            payment_settled: false,
                                      },
                                },
                          },
                          include: {
                                address: true,
                                loan: true,
                          },
                    });

            const total = condition
                  ? await this.repository.client.count(
                          {} as Prisma.ClientCountArgs,
                    )
                  : await this.repository.client.count();

            const clients: Client[] = items.map((item: Client) => {
                  // Faça a conversão de tipo de PrismaClient para Client
                  const { address, loan, ...rest } = item;
                  return {
                        ...rest,
                        address: address as any,
                        loan: loan as any,
                  } as Client;
            });

            return this.buildPageResponse(
                  clients,
                  Array.isArray(total) ? total.length : total,
            );
      }

      private buildQuery(options: {
            page: Page;
            where?: any;
            include?: any;
      }): Prisma.ClientFindManyArgs {
            const { page, where, include } = options;

            const query: Prisma.ClientFindManyArgs = {
                  ...this.buildPage(page),
                  include: include,
            };

            if (where) {
                  query.where = where;
            }

            return query;
      }

      async create(data: Client): Promise<any> {
            const attendant = await this.repository.user.findFirst({
                  where: {
                        name: {
                              contains: data.attendant,
                              mode: 'insensitive',
                        },
                  },
            });
            return this.repository.client.create({
                  data: {
                        id: data.id,
                        name: data.name,
                        fone: data.fone,
                        attendant: attendant.name,
                        attendantUser: {
                              connect: {
                                    id: attendant.id,
                              },
                        },
                        approved: data.approved,
                        observation: data.observation,
                        address: {
                              create: {
                                    id: data.address.id,
                                    city: data.address.city,
                                    district: data.address.district,
                                    number: data.address.number,
                                    street: data.address.street,
                              },
                        },
                        loan: {
                              createMany: {
                                    data: data.loan.map<Loan>((loan) => ({
                                          id: loan.id,
                                          value_loan: loan.value_loan,
                                          interest_rate: loan.interest_rate,
                                          approved: loan.approved,
                                          only_pay_interest: false,
                                          format_instalment:
                                                loan.format_instalment,
                                          rest_loan: loan.rest_loan,
                                          dueDate: loan.dueDate,
                                          startDate: loan.startDate,
                                    })),
                              },
                        },
                  },
                  include: {
                        address: true,
                        loan: true,
                  },
            });
      }
      async delete(id: string): Promise<Client> {
            return await this.repository.client.delete({
                  where: { id },
                  include: {
                        address: true,
                        loan: true,
                  },
            });
      }

      async update(id: string, data: UpdateClientDto): Promise<Client | null> {
            const attendant = await this.repository.user.findFirst({
                  where: {
                        name: {
                              contains: data.attendant,
                              mode: 'insensitive',
                        },
                  },
            });

            if (!attendant) {
                  throw new Error('Atendente não encontrado');
            }

            return await this.repository.client.update({
                  where: {
                        id,
                  },
                  data: {
                        name: data.name,
                        fone: data.fone,
                        attendant: attendant.name,
                        attendantUser: {
                              connect: {
                                    id: attendant.id,
                              },
                        },
                        approved: data.approved,
                        observation: data.observation,
                        address: {
                              update: {
                                    city: data.address.city,
                                    district: data.address.district,
                                    number: data.address.number,
                                    street: data.address.street,
                              },
                        },
                        // loan: {
                        //       update: {
                        //             where: {
                        //                   id: data.loan.id,
                        //             },
                        //             data: {
                        //                   value_loan:data.loan
                        //             },
                        //       },
                        // },
                  },
                  include: {
                        address: true,
                        loan: true,
                  },
            });
      }
}
