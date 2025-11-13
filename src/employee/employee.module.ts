import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { AuthClientModule } from '../auth-client/auth-client.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [AuthClientModule, HttpModule],
  controllers: [EmployeeController],
  providers: [EmployeeService],
})
export class EmployeeModule {}
