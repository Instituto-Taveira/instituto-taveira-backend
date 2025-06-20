import { Titular as PrismaPessoa } from '@prisma/client';
import { Titular } from '../entities/titular.entity';
import { CPF } from '../entities/cpf.entity';
import { CreateDependenteDTO, CreatePessoaDTO } from 'src/dto/pessoa/createPessoa.dto';
import { UpdatePessoaDTO } from 'src/dto/pessoa/updatePessoa.dto';
import e from 'express';

export class TitularMapper {
  static toDomain(prisma: PrismaPessoa): Titular {
    return new Titular({
      nome: prisma.nome,
      dataNascimento: prisma.dataNascimento,
      cpf: new CPF(prisma.cpf),
      rg: prisma.rg ?? undefined,
      tituloEleitor: prisma.tituloEleitor ?? undefined,
      localVotacao: prisma.localVotacao ?? undefined,
      cartaoSUS: prisma.cartaoSUS ?? undefined,
      numeroContato: prisma.numeroContato ?? undefined,
      whatsapp: prisma.whatsapp ?? undefined,
      fotoBase64: prisma.fotoBase64 ?? undefined,
      endereco: undefined,
      updatedAt: prisma.updatedAt,
    }, prisma.id);
  }

  static toPrismaCreate(dto: CreatePessoaDTO) {
    const pessoaData: any = {
      nome: dto.nome,
      dataNascimento: dto.dataNascimento,
      cpf: new CPF(dto.cpf).getValue(),
      rg: dto.rg,
      tituloEleitor: dto.tituloEleitor,
      localVotacao: dto.localVotacao,
      cartaoSUS: dto.cartaoSUS,
      numeroContato: dto.numeroContato,
      whatsapp: dto.whatsapp,
      fotoBase64: dto.fotoBase64,
      zona: dto.zona,
      secao: dto.secao,
      endereco: {
        cep: dto.endereco?.cep,
        rua: dto.endereco?.rua,
        numero: dto.endereco?.numero,
        bairro: dto.endereco?.bairro,
        cidade: dto.endereco?.cidade,
        estado: dto.endereco?.estado,
        complemento: dto.endereco?.complemento,
        pontoReferencia: dto.endereco?.pontoReferencia,
      },
    };

    if (dto.dependentes?.length) {
      pessoaData.Dependente = {
        create: dto.dependentes.map((dep: CreateDependenteDTO) => {
          const d: any = {
            nome: dep.nome,
            dataNascimento: new Date(dep.dataNascimento),
            cpf: dep.cpf,
            rg: dep.rg,
            tituloEleitor: dep.tituloEleitor,
            localVotacao: dep.localVotacao,
            cartaoSUS: dep.cartaoSUS,
            numeroContato: dep.numeroContato,
            whatsapp: dep.whatsapp,
            fotoBase64: dep.fotoBase64,
            tipo: dep.tipo,
            zona: dep.zona,
            secao: dep.secao,
            endereco: {
              cep: dep.endereco?.cep,
              rua: dep.endereco?.rua,
              numero: dep.endereco?.numero,
              bairro: dep.endereco?.bairro,
              cidade: dep.endereco?.cidade,
              estado: dep.endereco?.estado,
              complemento: dep.endereco?.complemento,
              pontoReferencia: dep.endereco?.pontoReferencia,
            },
          };

          return d;
        }),
      };
    }

    return pessoaData;
  }

  static toPrismaUpdate(dto: UpdatePessoaDTO) {
    const pessoaData: any = {
      nome: dto.nome,
      dataNascimento: dto.dataNascimento,
      cpf: new CPF(dto.cpf).getValue(),
      rg: dto.rg,
      tituloEleitor: dto.tituloEleitor,
      localVotacao: dto.localVotacao,
      cartaoSUS: dto.cartaoSUS,
      numeroContato: dto.numeroContato,
      whatsapp: dto.whatsapp,
      fotoBase64: dto.fotoBase64,
      zona: dto.zona,
      secao: dto.secao,
      // Removido campo endereco do objeto userFields
    };

    return {
      userFields: pessoaData,
      endereco: dto.endereco ?? null,
      dependentes: dto.dependentes?.map(dep => ({
        id: dep.id,
        nome: dep.nome,
        dataNascimento: new Date(dep.dataNascimento),
        cpf: dep.cpf,
        rg: dep.rg,
        tituloEleitor: dep.tituloEleitor,
        localVotacao: dep.localVotacao,
        cartaoSUS: dep.cartaoSUS,
        numeroContato: dep.numeroContato,
        whatsapp: dep.whatsapp,
        fotoBase64: dep.fotoBase64,
        tipo: dep.tipo,
        zona: dep.zona,
        secao: dep.secao,
        endereco: dep.endereco ?? null,
      })) ?? []
    };
  }


  static toHttp(pessoa: Partial<Titular>): any {
    return {
      ...pessoa,
      cpf: pessoa.cpf instanceof CPF ? pessoa.cpf.getValue() : pessoa.cpf,
      endereco: pessoa.endereco ?? null
    };
  }

  static toEntity(data: any): Titular {
    return new Titular({
      ...data,
      cpf: new CPF(data.cpf),
    }, data.id);
  }
}
