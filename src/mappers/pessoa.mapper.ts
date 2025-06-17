// src/mappers/pessoa.mapper.ts

import { Pessoa as PrismaPessoa } from '@prisma/client';
import { Pessoa } from '../entities/pessoa.entity';
import { CPF } from '../entities/cpf.entity';
import { CreateDependenteDTO, CreatePessoaDTO } from 'src/dto/pessoa/createPessoa.dto';
import { UpdatePessoaDTO } from 'src/dto/pessoa/updatePessoa.dto';

export class PessoaMapper {
    static toDomain(prisma: PrismaPessoa): Pessoa {
        return new Pessoa({
            nome: prisma.nome,
            dataNascimento: prisma.dataNascimento,
            cpf: new CPF(prisma.cpf),
            rg: prisma.rg ?? undefined,
            tituloEleitor: prisma.tituloEleitor ?? undefined,
            localVotacao: prisma.localVotacao ?? undefined,
            cartaoSUS: prisma.cartaoSUS ?? undefined,
            numeroContato: prisma.numeroContato ?? undefined,
            whatsapp: prisma.whatsapp ?? undefined,
            endereco: prisma.endereco ?? undefined,
            rua: prisma.rua,
            numero: prisma.numero,
            bairro: prisma.bairro,
            complemento: prisma.complemento ?? undefined,
            pontoReferencia: prisma.pontoReferencia ?? undefined,
            cidade: prisma.cidade,
            estado: prisma.estado,
            cep: prisma.cep,
            fotoBase64: prisma.fotoBase64 ?? undefined,
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
            endereco: dto.endereco,
            rua: dto.rua,
            numero: dto.numero,
            bairro: dto.bairro,
            complemento: dto.complemento,
            pontoReferencia: dto.pontoReferencia,
            cidade: dto.cidade,
            estado: dto.estado,
            cep: dto.cep,
            fotoBase64: dto.fotoBase64,
        };

        if (dto.dependentes?.length) {
            pessoaData.Dependente = {
                create: dto.dependentes.map((dep: CreateDependenteDTO) => {
                    const d: any = {
                        nome: dep.nome,
                        dataNascimento: new Date(dep.dataNascimento),
                    };
                    if (dep.cpf) d.cpf = dep.cpf;
                    if (dep.rg) d.rg = dep.rg;
                    if (dep.tituloEleitor) d.tituloEleitor = dep.tituloEleitor;
                    if (dep.localVotacao) d.localVotacao = dep.localVotacao;
                    if (dep.cartaoSUS) d.cartaoSUS = dep.cartaoSUS;
                    if (dep.numeroContato) d.numeroContato = dep.numeroContato;
                    if (dep.fotoBase64) d.fotoBase64 = dep.fotoBase64;
                    if (dep.tipo) d.tipo = dep.tipo;

                    return d;
                }),
            };
        }

        return pessoaData;
    }

    static toPrismaUpdate(dto: UpdatePessoaDTO) {
        // campos básicos (sem nested)
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
            endereco: dto.endereco,
            rua: dto.rua,
            numero: dto.numero,
            bairro: dto.bairro,
            complemento: dto.complemento,
            pontoReferencia: dto.pontoReferencia,
            cidade: dto.cidade,
            estado: dto.estado,
            cep: dto.cep,
            fotoBase64: dto.fotoBase64,
        };
        return {
            userFields: pessoaData,
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
                fotoBase64: dep.fotoBase64,
                tipo: dep.tipo,
            })) ?? []
        };
    }

    static toHttp(pessoa: Partial<Pessoa>): any {
        return {
            ...pessoa,
            cpf: pessoa.cpf instanceof CPF ? pessoa.cpf.getValue() : pessoa.cpf,
        };
    }

    static toEntity(data: any): Pessoa {
        return new Pessoa({
            ...data,
            cpf: new CPF(data.cpf),
        }, data.id);
    }
}
