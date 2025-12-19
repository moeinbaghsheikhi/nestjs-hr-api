import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Payroll } from "../entities/payroll.entity";
import { User } from "src/modules/auth/entities/user.entity";
import { CreatePayrollDto } from "../dto/create-payroll.dto";
import { FilterPayrollDto } from "../dto/filter-payroll.dto";
import { UpdatePayrollDto } from "../dto/update-payroll.dto";
import { PayrollStatus } from "../enums/payroll-status.enum";


@Injectable()
export class PayrollManagerService{
    constructor(
        @InjectRepository(Payroll)
        private readonly payrollRepo: Repository<Payroll>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>
    ){}

    async create(dto: CreatePayrollDto){
        const user = await this.userRepo.findOne({ where: {id: dto.userId} })
        if(!user) throw new NotFoundException('کاربر یافت نشد');

        const exsisting = await this.payrollRepo.findOne({
            where: {
                user: { id: dto.userId },
                salaryPeriod: dto.salaryPeriod
            }
        })
        if(exsisting) throw new BadRequestException('برای این دوره قبلا فیش حقوقی صادر شده است');

        const bonuses = dto.bonuses || 0;
        const deduction = dto.deductions || 0;
        const totalAmount = dto.baseSalary + bonuses - deduction;

        let paymentDate
        if(dto.status){
            if(dto.status == PayrollStatus.PAID) paymentDate = new Date();
        }

        const payroll = this.payrollRepo.create({
            user,
            salaryPeriod: dto.salaryPeriod,
            baseSalary: dto.baseSalary,
            bonuses,
            deduction,
            totalAmount,
            paymentDate: paymentDate || null,
            status: dto.status || PayrollStatus.PENDING,
            notes: dto.notes || null
        });

        return await this.payrollRepo.save(payroll);
    }

    async update(id: number, dto: UpdatePayrollDto){
        const payroll = await this.findOne(id);

        if(dto.salaryPeriod) payroll.salaryPeriod = dto.salaryPeriod;
        if(dto.baseSalary) payroll.baseSalary = dto.baseSalary;
        if(dto.bonuses) payroll.bonuses = dto.bonuses;
        if(dto.deductions) payroll.deduction = dto.deductions;
        
        if(dto.status){
            payroll.status = dto.status;
            if(dto.status == PayrollStatus.PAID && !payroll.paymentDate){
                payroll.paymentDate = new Date();
            }
        }

        payroll.totalAmount = payroll.baseSalary + payroll.bonuses - payroll.deduction;

        return await this.payrollRepo.save(payroll);
    }

    async findAll(filters: FilterPayrollDto){
        const queryBuilder = this.payrollRepo
            .createQueryBuilder('payrolls')
            .leftJoinAndSelect('payrolls.user', 'users');
        
        if(filters.userId){
            queryBuilder.andWhere('payrolls.userId = :userId', { userId: filters.userId })
        }

        if(filters.salaryPeriod){
            queryBuilder.andWhere('payrolls.salaryPeriod = :salaryPeriod', { salaryPeriod: filters.salaryPeriod })
        }

        if(filters.status){
            queryBuilder.andWhere('payrolls.status = :status', { status: filters.status })
        }

        return await queryBuilder
            .orderBy('payrolls.salaryPeriod', 'DESC')
            .addOrderBy('payrolls.createdAt', 'DESC')
            .getMany();
    }

    async findOne(id: number){
        const payroll = await this.payrollRepo.findOne({
            where: {id},
            relations: ['user']
        })
        if(!payroll) throw new NotFoundException('فیش حقوقی مد نظر شما یافت نشدُ')

        return payroll;
    }

    async remove (id: number) {
        const payroll = await this.findOne(id);
        await this.payrollRepo.remove(payroll);
    }
}