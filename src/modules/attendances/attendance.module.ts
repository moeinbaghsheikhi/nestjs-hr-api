import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { User } from '../auth/entities/user.entity';
// import { AttendanceManagerController } from './controllers/attendance-manager.controller';
import { AttendanceEmployeeController } from './controllers/attendance-employee.controller';
// import { AttendanceManagerService } from './services/attendance-manager.service';
import { AttendanceEmployeeService } from './services/attendance-employee.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, User]),
  ],
  controllers: [
    // AttendanceManagerController,
    AttendanceEmployeeController,
  ],
  providers: [
    // AttendanceManagerService,
    AttendanceEmployeeService,
  ],
})
export class AttendanceModule {}