import { CPF } from './cpf.entity';

export class Pessoa {
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
      endereco?: string;
      rua: string;
      numero: string;
      bairro: string;
      complemento?: string;
      pontoReferencia?: string;
      cidade: string;
      estado: string;
      cep: string;
      fotoBase64?: string;
      createdAt: Date;
      updatedAt?: Date | null;
      dependentes?: {
            nome: string;
            dataNascimento: Date;
            cpf?: string;
            rg?: string;
            tituloEleitor?: string;
            localVotacao?: string;
            cartaoSUS?: string;
            numeroContato?: string;
      }[];

      constructor(props: Omit<Pessoa, 'id' | 'createdAt'>, id?: number) {
            Object.assign(this, props);
            this.id = id;
            this.createdAt = new Date();
      }
}
