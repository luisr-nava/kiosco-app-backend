import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import type { Request } from 'express';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthClientService } from '../auth-client/auth-client.service';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';
import { GetUser } from '../auth-client/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth-client/guards/jwt-auth.guard';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async registerEmployee(
    @Body() dto: CreateEmployeeDto,
    @GetUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.employeeService.registerEmployee(dto, user, token!);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @GetUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.employeeService.updateEmployee(
      id,
      updateEmployeeDto,
      user,
      token!,
    );
  }
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllEmployees(
    @GetUser() user: JwtPayload,
    @Query('shopId') shopId?: string,
  ) {
    return this.employeeService.findAll(user, shopId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @GetUser() user: JwtPayload) {
    return this.employeeService.findOne(id, user);
  }
}
