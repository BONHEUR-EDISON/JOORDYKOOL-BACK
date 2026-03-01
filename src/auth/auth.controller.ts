// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ------------------- REGISTER + AVATAR -------------------
  @Post('register')
  @UseInterceptors(
    FileInterceptor('avatarFile', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (_req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(new BadRequestException('Seuls les fichiers JPG, JPEG et PNG sont autorisés!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
    }),
  )
  async register(
    @Body() dto: RegisterDto,
    @UploadedFile() avatarFile?: Express.Multer.File,
  ) {
    if (avatarFile) {
      dto.avatarUrl = `/uploads/avatars/${avatarFile.filename}`;
    }
    return await this.authService.register(dto);
  }

  // ------------------- VERIFY OTP -------------------
  @Post('verify-otp')
  async verifyOtp(@Body() body: VerifyOtpDto) {
    const phone = body.phone ?? undefined;
    const email = body.email ?? undefined;
    const otp = body.otp;

    return await this.authService.verifyOtp(phone, email, otp);
  }

  // ------------------- LOGIN -------------------
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto.email, dto.phone, dto.password);
  }

  // ------------------- REFRESH TOKEN -------------------
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return await this.authService.refreshToken(refreshToken);
  }

  // ------------------- LOGOUT -------------------
  @Post('logout')
  async logout(@Body() body: { userId: string; token: string }) {
    return await this.authService.logout(body.userId, body.token);
  }
}
