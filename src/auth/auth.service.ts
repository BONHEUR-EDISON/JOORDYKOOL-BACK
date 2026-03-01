import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import Africastalking from 'africastalking';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';

interface RegisterDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  password: string;
  city?: string;
  province: string;
  avatarUrl?: string;
  country?: string;
}

@Injectable()
export class AuthService {
  private africastalking: any;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  onModuleInit() {
    const username =
      this.configService.get<string>('AFRICASTALKING_USERNAME') ||
      process.env.AFRICASTALKING_USERNAME;
    const apiKey =
      this.configService.get<string>('AFRICASTALKING_API_KEY') ||
      process.env.AFRICASTALKING_API_KEY;

    if (!username || !apiKey)
      throw new Error("Africa's Talking API key and username must be defined");

    this.africastalking = new Africastalking({ username, apiKey });
    console.log(
      `Africa's Talking initialized in ${username === 'sandbox' ? 'SANDBOX' : 'PRODUCTION'} mode`,
    );
  }

  // ===================== REGISTER =====================
  async register(data: RegisterDto) {
    // Vérifier si email ou téléphone existe déjà
    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ phone: data.phone }, { email: data.email }] },
    });
    if (existingUser)
      throw new BadRequestException('Numéro ou email déjà utilisé');

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Générer OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Créer l’utilisateur
    const user = await this.prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        city: data.city,
        province: data.province,
        country: data.country || 'RDC',
        avatarUrl: data.avatarUrl || null,
        otpCode: hashedOtp,
        otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
      } as Prisma.UserUncheckedCreateInput,
    });

    // Envoyer OTP par SMS
    await this.sendSms(user.phone, `Votre code OTP Joordy Kool est: ${otp}`);

    return {
      message: 'OTP généré et envoyé',
      userId: user.id,
      avatarUrl: user.avatarUrl,
    };
  }

  // ===================== VERIFY OTP =====================
  async verifyOtp(phone?: string, email?: string, otp?: string) {
    if (!otp) {
      throw new BadRequestException('OTP requis');
    }

    if (!phone && !email) {
      throw new BadRequestException('Email ou téléphone requis');
    }

    const user = phone
      ? await this.prisma.user.findUnique({ where: { phone } })
      : await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.otpCode) {
      throw new UnauthorizedException('Utilisateur invalide');
    }

    if (user.otpExpiresAt! < new Date()) {
      throw new UnauthorizedException('OTP expiré');
    }

    const isValid = await bcrypt.compare(otp, user.otpCode);
    if (!isValid) {
      throw new UnauthorizedException('OTP incorrect');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    const token = this.jwtService.sign({
      sub: user.id,
      phone: user.phone,
      email: user.email,
    });

    return {
      message: 'OTP validé avec succès',
      access_token: token,
      user,
    };
  }
  // ===================== LOGIN =====================
  // src/auth/auth.service.ts

  async login(email?: string, phone?: string, password?: string) {
    // Chercher l'utilisateur par email ou téléphone
    const user = email
      ? await this.prisma.user.findUnique({ where: { email } })
      : phone
        ? await this.prisma.user.findUnique({ where: { phone } })
        : null;

    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');
    if (!password) throw new BadRequestException('Mot de passe requis');

    const validPassword = await bcrypt.compare(password, user.password!);
    if (!validPassword)
      throw new UnauthorizedException('Mot de passe incorrect');

    // -------------------
    // Vérification OTP uniquement si le compte n'est pas encore vérifié
    // -------------------
    if (!user.isVerified) {
      return {
        message: 'Compte non vérifié. Veuillez valider votre OTP.',
        requiresOtp: true,
        userId: user.id, // tu peux renvoyer l'id pour préparer l'étape OTP côté front
      };
    }

    // Si le compte est déjà vérifié, renvoyer directement les tokens
    const tokens = this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      ...tokens,
    };
  }

  // ===================== REFRESH TOKEN =====================
  async refreshToken(token: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token },
    });
    if (!stored || stored.expiresAt < new Date())
      throw new UnauthorizedException('Refresh token expiré');

    const payload = this.jwtService.verify(token);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) throw new UnauthorizedException('Utilisateur invalide');

    const tokens = this.generateTokens(user);

    await this.prisma.refreshToken.delete({ where: { token } });
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  // ===================== LOGOUT =====================
  async logout(userId: string, token: string) {
    await this.prisma.refreshToken.deleteMany({ where: { userId, token } });
    return { message: 'Déconnexion réussie' };
  }

  // ===================== HELPERS =====================
  private generateTokens(user: any) {
    const payload = { sub: user.id, phone: user.phone, email: user.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, token: string) {
    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      },
    });
  }

  private async sendSms(phone: string, message: string) {
    try {
      const sms = this.africastalking.SMS;
      const response = await sms.send({ to: [phone], message });
      console.log("Africa's Talking SMS response:", response);
    } catch (error) {
      console.error('Erreur SMS:', error);
    }
  }
}
