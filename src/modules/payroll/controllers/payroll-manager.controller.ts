import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { PayrollManagerService } from '../services/payroll-manager.service';
import { CreatePayrollDto } from '../dto/create-payroll.dto';
import { UpdatePayrollDto } from '../dto/update-payroll.dto';
import { FilterPayrollDto } from '../dto/filter-payroll.dto';
import { Payroll } from '../entities/payroll.entity';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../../shared/enums/user-role.enum';

/**
 * کنترلر مدیریت حقوق و دستمزد برای پنل مدیر
 * فقط کاربران با نقش manager می‌توانند به این روت‌ها دسترسی داشته باشند
 */
@ApiBearerAuth()
@Roles(Role.MANAGER)
@Controller('manager/payroll')
export class PayrollManagerController {
  constructor(private readonly payrollService: PayrollManagerService) {}

  /**
   * ایجاد رکورد حقوق و دستمزد جدید
   */
  @Post()
  @ApiOperation({ summary: 'ایجاد رکورد حقوق و دستمزد جدید' })
  async create(@Body() dto: CreatePayrollDto): Promise<Payroll> {
    return await this.payrollService.create(dto);
  }

  /**
   * دریافت تمام رکوردهای حقوق و دستمزد با فیلتر
   */
  @Get()
  @ApiOperation({ summary: 'دریافت تمام رکوردهای حقوق و دستمزد' })
  async findAll(@Query() filters: FilterPayrollDto): Promise<Payroll[]> {
    return await this.payrollService.findAll(filters);
  }

  /**
   * دریافت یک رکورد حقوق و دستمزد با شناسه
   */
  @Get(':id')
  @ApiOperation({ summary: 'دریافت یک رکورد حقوق و دستمزد' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Payroll> {
    return await this.payrollService.findOne(id);
  }

  /**
   * به‌روزرسانی رکورد حقوق و دستمزد
   */
  @Patch(':id')
  @ApiOperation({ summary: 'به‌روزرسانی رکورد حقوق و دستمزد' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePayrollDto,
  ): Promise<Payroll> {
    return await this.payrollService.update(id, dto);
  }

  /**
   * حذف رکورد حقوق و دستمزد
   */
  @Delete(':id')
  @ApiOperation({ summary: 'حذف رکورد حقوق و دستمزد' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    await this.payrollService.remove(id);
    return { success: true };
  }
}