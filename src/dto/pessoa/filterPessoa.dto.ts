export class FiltersPessoaDTO {
      nome?: string;
      cpf?: string;
      rg?: string;
      dataNascimento?: string; // formato ISO
      cidade?: string;
      bairro?: string;
      estado?: string;
      whatsapp?: string;
      modalidade?: string;
      vinculo?: string; // "Titular" ou "Dependente"
      page?: string;
      limit?: string;
      initialDate?: string; // formato ISO
      finalDate?: string; // formato ISO
}
