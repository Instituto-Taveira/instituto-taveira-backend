import { Injectable } from '@nestjs/common';
import { generateQueryByFiltersForClient } from '../../config/database/Queries';
import { Page, PageResponse } from '../../config/database/page.model';
import { Pageable } from '../../config/database/pageable.service';
import { PrismaService } from '../../config/database/prisma.service';
import { FiltersClientDTO } from '../../dto/client/filterClient.dto';
import { Client } from '../../entities/client.entity';
import IClientRepository from './client.repository.contract';
import { Loan } from '../../entities/loan.entity';
import { UpdateClientDto } from '../../dto/client/updateClient.dto';
import { Client as PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class ClientRepository
      extends Pageable<Client>
      implements IClientRepository
{
      constructor(private readonly repository: PrismaService) {
            super();
      }
      async findAll(page: Page, filters?: FiltersClientDTO): Promise<any> {
            const condition = generateQueryByFiltersForClient(filters);

            const items: any = condition
                  ? await this.repository.client.findMany({
                          ...this.buildPage(page),
                          where: condition,
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
                                },
                          },
                    })
                  : await this.repository.client.findMany({
                          ...this.buildPage(page),
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

      create(data: Client): Promise<any> {
            return this.repository.client.create({
                  data: {
                        id: data.id,
                        name: data.name,
                        fone: data.fone,
                        attendant: data.attendant,
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
      delete(id: string): Promise<Client> {
            return this.repository.client.delete({
                  where: { id },
                  include: {
                        address: true,
                        loan: true,
                  },
            });
      }

      update(id: string, data: UpdateClientDto): Promise<Client | null> {
            return this.repository.client.update({
                  where: {
                        id,
                  },
                  data: {
                        name: data.name,
                        fone: data.fone,
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
