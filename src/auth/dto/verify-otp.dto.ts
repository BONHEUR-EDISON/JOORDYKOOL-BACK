// src/auth/dto/verify-otp.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class VerifyOtpDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  otp: string;
}
