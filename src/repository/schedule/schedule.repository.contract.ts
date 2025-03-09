import { Schedule } from 'src/entities/schedule.entity';

export default interface IScheduleRepository {
      create(schedule: Schedule): Promise<void>;
      findAll(): Promise<Schedule[]>;
}
