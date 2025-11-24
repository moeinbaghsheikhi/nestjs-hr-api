import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { DepartmentsManagerService } from '../services/departments-manager.service';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';
import { Department } from '../entities/department.entity';

/**
 * کنترلر ادمین برای مدیریت دپارتمان‌ها
 * مسیرهای CRUD را ارائه می‌دهد
 */
// api.hrsystem.ir/manager
@Controller('manager/departments')
export class DepartmentsManagerController {
  constructor(private readonly departmentsService: DepartmentsManagerService) {}

  /** POST /admin/departments */
  @Post()
  async create(@Body() dto: CreateDepartmentDto): Promise<Department> {
    return await this.departmentsService.create(dto);
  }

  /** GET /admin/departments */
  @Get()
  async findAll(): Promise<Department[]> {
    return await this.departmentsService.findAll();
  }

  /** GET /admin/departments/:id */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Department> {
    return await this.departmentsService.findOne(id);
  }

  /** PATCH /admin/departments/:id */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartmentDto,
  ): Promise<Department> {
    return await this.departmentsService.update(id, dto);
  }

  /** DELETE /admin/departments/:id */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    await this.departmentsService.remove(id);
    return { success: true };
  }
}

