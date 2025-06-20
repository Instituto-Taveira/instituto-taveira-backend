import { CPF } from './cpf.entity';

export interface Modalidade {
      nome: string;
}

export class Titular {
      id: number;
      nome: string;
      dataNascimento: Date;
      cpf: CPF;
      rg?: string;
      tituloEleitor?: string;
      localVotacao?: string;
      cartaoSUS?: string;
      numeroContato?: string;
      whatsapp?: string;
      fotoBase64?: string;
      zona?: string;
      secao?: string;
      createdAt: Date;
      updatedAt?: Date | null;
      modalidade?: string[];
      tipoVinculo?: string;
      endereco: {
            cep: string;
            rua: string;
            numero: string;
            bairro: string;
            cidade: string;
            estado: string;
            complemento?: string;
            pontoReferencia?: string;
      }
      dependentes?: {
            nome: string;
            dataNascimento: Date;
            fotoBase64: string;
            cpf?: string;
            rg?: string;
            tituloEleitor?: string;
            localVotacao?: string;
            cartaoSUS?: string;
            numeroContato?: string;
            tipoVinculo?: string;
            endereco?: {
                  cep: string;
                  rua: string;
                  numero: string;
                  bairro: string;
                  cidade: string;
                  estado: string;
            }
      }[];

      constructor(props: Omit<Titular, 'id' | 'createdAt'>, id?: number) {
            Object.assign(this, props);
            this.id = id;
            this.createdAt = new Date();
      }
}
