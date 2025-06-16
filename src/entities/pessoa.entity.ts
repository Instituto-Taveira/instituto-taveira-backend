import { v4 as uuid } from 'uuid';

export class Pessoa {
      id: string;
      nome: string;
      dataNascimento: Date;
      cpf: string;
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
      dependenteDeId?: string;
      fotoBase64?: string;

      createdAt: Date;
      updatedAt?: Date | null;

      constructor(props: Omit<Pessoa, 'id' | 'createdAt'>, id?: string) {
            Object.assign(this, props);
            this.id = id ?? uuid();
            this.createdAt = new Date();
      }
}
