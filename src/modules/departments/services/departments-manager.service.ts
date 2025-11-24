import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';

/**
 * سرویس مدیریت دپارتمان‌ها برای پنل ادمین
 * شامل عملیات CRUD کامل است
 */
@Injectable()
export class DepartmentsManagerService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  /** ایجاد دپارتمان جدید */
  async create(payload: CreateDepartmentDto): Promise<Department> {
    const department = this.departmentRepository.create(payload);
    return await this.departmentRepository.save(department);
  }

  /** دریافت همه دپارتمان‌ها */
  async findAll(): Promise<Department[]> {
    return await this.departmentRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /** دریافت یک دپارتمان با شناسه */
  async findOne(id: number): Promise<Department> {
    const department = await this.departmentRepository.findOne({ where: { id } });
    if (!department) {
      throw new NotFoundException(`Department with id ${id} not found`);
    }
    return department;
  }

  /** به‌روزرسانی اطلاعات دپارتمان */
  async update(id: number, payload: UpdateDepartmentDto): Promise<Department> {
    const department = await this.findOne(id);
    const merged = this.departmentRepository.merge(department, payload);
    return await this.departmentRepository.save(merged);
  }

  /** حذف دپارتمان */
  async remove(id: number): Promise<void> {
    const department = await this.findOne(id);
    await this.departmentRepository.remove(department);
  }
}

