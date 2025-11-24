import { TypeOrmModule } from "@nestjs/typeorm";
import { Department } from "./entities/department.entity";
import { Module } from "@nestjs/common";
import { DepartmentsManagerController } from "./controllers/departments-manager.controller";
import { DepartmentsManagerService } from "./services/departments-manager.service";
import { DepartmentsEmployeeController } from "./controllers/departments-employee.controller";
import { DepartmentsEmployeeService } from "./services/departments-employee.service";


@Module({
    imports: [
        TypeOrmModule.forFeature([Department])
    ],
    controllers: [DepartmentsManagerController, DepartmentsEmployeeController],
    providers: [DepartmentsManagerService, DepartmentsEmployeeService]
})

export class DepartmentsModule {}