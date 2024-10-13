import {
      Controller,
      Get,
      Body,
      Param,
      Delete,
      Put,
      UseGuards,
} from '@nestjs/common';
import { AddressService } from '../services/address.service';
import { UpdateAddressDto } from '../dto/address/update-address.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/config/authentication/guards/jwtAuth.guard';

@ApiTags('Address')
@ApiBearerAuth()
@Controller('address')
export class AddressController {
      constructor(private readonly addressService: AddressService) {}

      @ApiOperation({
            summary: 'Listar Endereços',
            description: 'Utilize este endpointpara listar todos os endereços.',
      })
      @UseGuards(JwtAuthGuard)
      @Get()
      findAll() {
            return this.addressService.findAll();
      }

      @ApiOperation({
            summary: 'Buscar Endereço',
            description:
                  'Utilize este endpoint para buscar um endereço por ID.',
      })
      @UseGuards(JwtAuthGuard)
      @Get(':id')
      findOne(@Param('id') id: string) {
            return this.addressService.findOne(id);
      }

      @ApiOperation({
            summary: 'Atualizar Endereço',
            description: 'Utilize este endpoint para atualizar um endereço.',
      })
      @UseGuards(JwtAuthGuard)
      @Put(':clientId')
      update(
            @Param('clientId') clientId: string,
            @Body() updateAddressDto: UpdateAddressDto,
      ) {
            return this.addressService.update(clientId, updateAddressDto);
      }

      @ApiOperation({
            summary: 'Deletar Endereço',
            description: 'Utilize este endpoint para deletar um endereço.',
      })
      @UseGuards(JwtAuthGuard)
      @Delete(':id')
      remove(@Param('id') id: string) {
            return this.addressService.remove(id);
      }
}
