import { User } from "src/modules/auth/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PayrollStatus } from "../enums/payroll-status.enum";


@Entity('payrolls')
export class Payroll {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { eager: true })
    user: User;

    @Column({ type: 'varchar', length: 7 })
    salaryPeriod: string;

    @Column()
    baseSalary: number;

    @Column({ default: 0 })
    bonuses: number;

    @Column({ default: 0 })
    deduction: number;

    @Column()
    totalAmount: number;

    @Column({ type: 'enum', enum: PayrollStatus, default: PayrollStatus.PENDING })
    status: PayrollStatus;

    @Column({ type: 'timestamp', nullable: true })
    paymentDate: Date;

    @Column({ type: 'varchar', length: 250 , nullable: true })
    notes: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}