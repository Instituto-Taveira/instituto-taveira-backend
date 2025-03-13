import { Schedule } from 'src/entities/schedule.entity';

export default interface IScheduleRepository {
      create(schedule: Schedule, loanIds: string[]): Promise<void>;
      findAll(): Promise<Schedule[]>;
}
