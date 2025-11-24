import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentsModule } from './modules/departments/departments.module';

@Module({
  imports: [
    // configModule for get env variable data
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),

    // connect to database with typeorm
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USER', 'root'),
        password: configService.get('DB_PASS', ''),
        database: configService.get('DB_NAME', 'hr_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SUNCHRONIZE', 'true') === 'true'
      }),
      inject: [ConfigService]
    }),

    // imports project modules
    DepartmentsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
