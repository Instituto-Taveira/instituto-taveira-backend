import {
      Body,
      Controller,
      Get,
      Param,
      Post,
      Put,
      Headers,
} from '@nestjs/common';
import { CreateScheduleDTO } from 'src/dto/schedule/CreateSchedule.dto';
import { SendScheduleDTO } from 'src/dto/schedule/SendSchedule.dto';
import { ScheduleService } from 'src/services/schedule.service';

@Controller('api/schedule')
export class ScheduleController {
      constructor(private readonly scheduleService: ScheduleService) {}

      @Post()
      async create(@Body() createScheduleDTO: CreateScheduleDTO) {
            return await this.scheduleService.create(createScheduleDTO);
      }

      @Get()
      async findAll() {
            return await this.scheduleService.findAll();
      }

      @Get('client/:id')
      async findByClient(@Param('id') id: string) {
            return await this.scheduleService.findByClient(id);
      }

      @Post('send/:id')
      async send(
            @Param('id') id: string,
            @Headers('Authorization') token: string,
            @Body() body: SendScheduleDTO,
      ) {
            return await this.scheduleService.send(id, token, body);
      }
}
