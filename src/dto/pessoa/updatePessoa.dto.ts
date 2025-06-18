import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { UpdateDependenteDTO } from './createPessoa.dto';

export class UpdatePessoaDTO {

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    id?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    nome?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    dataNascimento?: Date;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    cpf?: string;

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
    zona?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    secao?: string;

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

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    rua?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    numero?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    bairro?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    complemento?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    pontoReferencia?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    cidade?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    estado?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    cep?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    fotoBase64?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    dependentes?: UpdateDependenteDTO[];
}
