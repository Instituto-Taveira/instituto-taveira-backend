// src/common/exceptions/cpf-exists.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class CPFExistsException extends HttpException {
  constructor() {
    super('Pessoa com esse CPF já cadastrada!', HttpStatus.BAD_REQUEST);
  }
}
