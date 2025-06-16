import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, Length } from 'class-validator';

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
      @IsString()
      endereco?: string;

      @ApiProperty()
      @IsString()
      rua: string;

      @ApiProperty()
      @IsString()
      numero: string;

      @ApiProperty()
      @IsString()
      bairro: string;

      @ApiProperty({ required: false })
      @IsOptional()
      @IsString()
      complemento?: string;

      @ApiProperty({ required: false })
      @IsOptional()
      @IsString()
      pontoReferencia?: string;

      @ApiProperty()
      @IsString()
      cidade: string;

      @ApiProperty()
      @IsString()
      estado: string;

      @ApiProperty()
      @IsString()
      cep: string;

      @ApiProperty({ required: false })
      @IsOptional()
      @IsString()
      dependenteDeId?: string;

      @ApiProperty({ required: false, description: 'Imagem em base64' })
      @IsOptional()
      @IsString()
      fotoBase64?: string;
}
