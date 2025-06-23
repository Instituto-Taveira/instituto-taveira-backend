import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdateModalidadeDto {

    @ApiProperty()
    @IsString()
    nome?: string;

    @ApiProperty()
    @IsString()
    descricao?: string;

}