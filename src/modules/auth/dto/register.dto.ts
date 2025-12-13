import { IsEmail, IsString, IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../../shared/enums/user-role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'شماره موبایل', example: '09135882813'})
  @IsString()
  mobile: string;

  @ApiProperty({ description: 'رمز عبور', example: '123456'})
  @IsString()
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}