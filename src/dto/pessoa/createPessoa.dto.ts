import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, Length } from 'class-validator';

export interface CreateDependenteDTO {
      id: number;
      nome: string;
      dataNascimento: Date;
      fotoBase64?: string;
      cpf?: string;
      rg?: string;
      cep?: string;
      rua?: string;
      numero?: string;
      bairro?: string;
      cidade?: string;
      estado?: string;
      numeroContato?: string;
      whatsapp?: string;
      tituloEleitor?: string;
      localVotacao?: string;
      zona?: string;
      secao?: string;
      cartaoSUS?: string;
      tipo: string;
      modalidade?: number[];
      endereco?: {
            cep: string;
            rua: string;
            numero: string;
            bairro: string;
            cidade: string;
            estado: string;
            complemento?: string;
            pontoReferencia?: string;
      }
}

export interface UpdateDependenteDTO {
      id: number;
      nome?: string;
      dataNascimento: Date;
      cpf?: string;
      rg?: string;
      cep?: string;
      rua?: string;
      numero?: string;
      bairro?: string;
      cidade?: string;
      estado?: string;
      numeroContato?: string;
      whatsapp?: string;
      tituloEleitor?: string;
      zona?: string;
      secao?: string;
      localVotacao?: string;
      cartaoSUS?: string;
      fotoBase64?: string;
      tipo?: string;
      endereco?: {
            cep: string;
            rua: string;
            numero: string;
            bairro: string;
            cidade: string;
            estado: string;
      }
}

export interface Endereco {
      cep: string;
      rua: string;
      numero: string;
      bairro: string;
      cidade: string;
      estado: string;
      complemento?: string;
      pontoReferencia?: string;
}

export class CreatePessoaDTO {
      @ApiProperty()
      @IsString()
      nome: string;

      @ApiProperty()
      @IsDateString()
      dataNascimento: Date;

      @ApiProperty()
      @IsString()
      @Length(11, 11)
      cpf: string;

      @ApiProperty({ required: false })
      @IsOptional()
      @IsString()
      rg?: string;

      @ApiProperty({ required: false })
      @IsOptional()
      @IsString()
      tituloEleitor?: string;

      @ApiProperty({ required: false })
      @IsOptional()
      @IsString()
      localVotacao?: string;

      @ApiProperty({ required: false })
      @IsOptional()
      @IsString()
      cartaoSUS?: string;

      @ApiProperty({ required: false })
      @IsOptional()
      @IsString()
      numeroContato?: string;

      @ApiProperty({ required: false })
      @IsOptional()
      @IsString()
      whatsapp?: string;

      @ApiProperty({ required: false })
      @IsOptional()
      dependentes?: CreateDependenteDTO[];

      @ApiProperty({ required: false, description: 'Imagem em base64' })
      @IsOptional()
      @IsString()
      fotoBase64?: string;

      @ApiProperty()
      @IsString()
      zona: string;

      @ApiProperty()
      @IsString()
      secao: string;

      @ApiProperty()
      @IsOptional()
      @IsString()
      modalidade?: number[];

      endereco: Endereco;

}
