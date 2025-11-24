import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO برای به‌روزرسانی دپارتمان
 * تمام فیلدها اختیاری هستند زیرا فقط موارد تغییر یافته ارسال می‌شوند
 */
export class UpdateDepartmentDto {
  /** نام جدید دپارتمان */
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  /** توضیحات جدید */
  @IsString()
  @IsOptional()
  description?: string;
}

