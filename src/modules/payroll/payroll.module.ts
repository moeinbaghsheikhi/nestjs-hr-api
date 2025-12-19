import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payroll } from './entities/payroll.entity';
import { User } from '../auth/entities/user.entity';
import { PayrollManagerController } from './controllers/payroll-manager.controller';
import { PayrollManagerService } from './services/payroll-manager.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payroll, User]),
  ],
  controllers: [
    PayrollManagerController,
  ],
  providers: [
    PayrollManagerService,
  ],
})
export class PayrollModule {}
