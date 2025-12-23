import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { TransformResponseInterceptor } from "../src/common/interceptors/transform-response.interceptor";
import { DataSource } from "typeorm";
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import { Role } from "../src/shared/enums/user-role.enum";
import { User } from "../src/modules/auth/entities/user.entity";
import { Attendance } from "../src/modules/attendances/entities/attendance.entity";

describe('Attendance (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    // emnployee data
    let employeeToken: string;
    let employeeId : number;

    // manager data
    let managerToken: string;
    let managerId : number;

    beforeAll(async ()=> {
        const moduleFixture : TestingModule = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        app = moduleFixture.createNestApplication();

        app.useGlobalInterceptors(new TransformResponseInterceptor());
        app.enableCors({
            origin: true,
            credentials: true
        });
        app.setGlobalPrefix('api/v1');

        dataSource = moduleFixture.get<DataSource>(DataSource);
        await app.init();

        const userRepo = dataSource.getRepository(User);

        // start create or login employee
        const employeeMobile   = '09100000000';
        const employeePassword = '123456';
        const hashedPassword   = await bcrypt.hash(employeePassword, 12);

        let   employee = await userRepo.findOne({ where: {mobile: employeeMobile, role: Role.EMPLOYEE} });

        if(!employee) {
            employee = userRepo.create({
                mobile: employeeMobile,
                password: hashedPassword,
                role: Role.EMPLOYEE
            });
            employee = await userRepo.save(employee);
        }

        employeeId = employee.id;

        const employeeLoginResponse = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({
                mobile: employeeMobile,
                password: employeePassword
            });

        employeeToken = employeeLoginResponse.body.data.accessToken;

        // start create or login manager
        const managerMobile     = '09200000000';
        const managerPassword   = '123456';
        const hashedPasswordM   = await bcrypt.hash(employeePassword, 12);

        let   manager = await userRepo.findOne({ where: {mobile: managerMobile, role: Role.MANAGER} });

        if(!manager) {
            manager = userRepo.create({
                mobile: managerMobile,
                password: hashedPasswordM,
                role: Role.MANAGER
            });
            manager = await userRepo.save(manager);
        }
        managerId = manager.id;

        const managerLoginResponse = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({
                mobile: managerMobile,
                password: managerPassword
            });

        managerToken = managerLoginResponse.body.data.accessToken;
    });

    afterAll(async () => {
        const attendanceRepo = dataSource.getRepository(Attendance);
        await attendanceRepo.delete({ user: { id: employeeId } })
    })

    describe('Employee Attendance', () => {
        describe('POST /employee/attendance/check-in - check-out', () => {
            it('باید ورود را با موفقیت ثبت کند', () =>{
                return request(app.getHttpServer())
                    .post('/api/v1/employee/attendance/check-in')
                    .set('Authorization', `Bearer ${employeeToken}`)
                    .send({ notes: 'ورود تست', j_date: '1404/01/01' })
                    .expect(201);
            });

            it('باید ورود را با موفقیت ثبت کند', () =>{
                return request(app.getHttpServer())
                    .post('/api/v1/employee/attendance/check-in')
                    .set('Authorization', `Bearer ${employeeToken}`)
                    .send({ notes: 'ورود تست', j_date: '1404/01/02' })
                    .expect(201);
            });

            it('دو ورود تکراری نباید در یک روز ثبت شود', () =>{
                return request(app.getHttpServer())
                    .post('/api/v1/employee/attendance/check-in')
                    .set('Authorization', `Bearer ${employeeToken}`)
                    .send({ notes: 'ورود تست', j_date: '1404/01/02' })
                    .expect(400);
            });

            it('رکورد بدون تاریخ ثبت نمیشود', () =>{
                return request(app.getHttpServer())
                    .post('/api/v1/employee/attendance/check-in')
                    .set('Authorization', `Bearer ${employeeToken}`)
                    .send({ notes: 'ورود تست' })
                    .expect(400);
            });


            it('باید ورود را با موفقیت ثبت کند', () =>{
                return request(app.getHttpServer())
                    .post('/api/v1/employee/attendance/check-in')
                    .set('Authorization', `Bearer ${employeeToken}`)
                    .send({ notes: 'ورود تست', j_date: '1404/01/05' })
                    .expect(201);
            });
            it('باید خروج را با موفقیت ثبت کند', () =>{
                return request(app.getHttpServer())
                    .post('/api/v1/employee/attendance/check-out')
                    .set('Authorization', `Bearer ${employeeToken}`)
                    .send({ j_date: '1404/01/05' })
                    .expect(201);
            });

            it('برای روزی که رکورد ورود ثبت نشده نمیتوان خروج ثبت کرد', () =>{
                return request(app.getHttpServer())
                    .post('/api/v1/employee/attendance/check-out')
                    .set('Authorization', `Bearer ${employeeToken}`)
                    .send({ j_date: '1404/01/07' })
                    .expect(404);
            });
        })

        describe('GET /employee/attendance', () => {
            it('باید لیست حضورغیاب های کارمند رو برگردونه', () => {
                return request(app.getHttpServer())
                    .get('/api/v1/employee/attendance')
                    .set('Authorization', `Bearer ${employeeToken}`)
                    .expect(200);
            })

            it('زمانی که توکن صحیح وارد نمیشود باید خطا بده', () => {
                return request(app.getHttpServer())
                    .get('/api/v1/employee/attendance')
                    .set('Authorization', `Bearer ${employeeToken}abc`)
                    .expect(401);
            })

            it('باید لیست حضورغیاب های کارمند رو برگردونه', () => {
                return request(app.getHttpServer())
                    .get('/api/v1/employee/attendance')
                    .set('Authorization', `Bearer ${managerToken}`)
                    .expect(403);
            })
        })
    })
})