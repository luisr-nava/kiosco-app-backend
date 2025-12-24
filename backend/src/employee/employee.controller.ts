import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';
import { GetUser } from '../auth-client/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth-client/guards/jwt-auth.guard';

@Controller()
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post('employees')
  @UseGuards(JwtAuthGuard)
  async registerEmployee(
    @Body() dto: CreateEmployeeDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.employeeService.registerEmployee(dto, user);
  }

  @Patch('employees/:id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.employeeService.updateEmployee(id, updateEmployeeDto, user);
  }

  @Get('shops/:shopId/employees')
  @UseGuards(JwtAuthGuard)
  async getAllEmployees(
    @GetUser() user: JwtPayload,
    @Param('shopId') shopId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.employeeService.findAll(
      user,
      shopId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get('employees/:id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @GetUser() user: JwtPayload) {
    return this.employeeService.findOne(id, user);
  }
}
