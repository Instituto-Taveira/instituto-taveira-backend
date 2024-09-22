import { FiltersClientDTO } from '../../dto/client/filterClient.dto';
import { Page, PageResponse } from '../../config/database/page.model';
import { Client } from '../../entities/client.entity';
import { UpdateClientDto } from 'src/dto/client/updateClient.dto';
import { GenerateReportLoanDto } from 'src/dto/loan/generate-report-loan.dto';
import { GenerateReportLoanClientDto } from 'src/dto/loan/generate-report-loan-client.dto';

export default interface IClientRepository {
      create(data: Client): Promise<Client>;
      delete(id: string): Promise<Client>;
      findAll(page: Page, filters?: FiltersClientDTO): Promise<any>;
      findAllPaymentTrue(
            page: Page,
            filters?: FiltersClientDTO,
      ): Promise<PageResponse<Client>>;
      generateReport(data: GenerateReportLoanDto): Promise<Client[]>;
      generateReportClient(data: GenerateReportLoanClientDto): Promise<Client>;
      listAllClients(): Promise<Partial<Client>[]>;
      findAllPaymentFalse(
            page: Page,
            filters?: FiltersClientDTO,
      ): Promise<PageResponse<Client>>;
      findById(id: string): Promise<any>;
      //   findByCpf(cpf: string): Promise<Client>;
      update(id: string, data: UpdateClientDto): Promise<Client>;
}
