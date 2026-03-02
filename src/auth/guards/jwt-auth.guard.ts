// auth/jwt.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];
    if (!authHeader) throw new UnauthorizedException('Token manquant');

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token)
      throw new UnauthorizedException('Token invalide');

    try {
      // Vérifier le JWT
      const payload = this.jwtService.verify(token);

      // Chercher l’utilisateur dans la DB
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) throw new UnauthorizedException('Utilisateur introuvable');

      // Injecter l’utilisateur dans request
      request['user'] = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
      };

      // Si un refreshToken est passé (ex: en header ou cookie), vérifier sa validité
      const refreshToken = request.headers['x-refresh-token'] as string;
      if (refreshToken) {
        const storedToken = await this.prisma.refreshToken.findUnique({
          where: { token: refreshToken },
        });
        if (!storedToken || storedToken.expiresAt < new Date()) {
          throw new UnauthorizedException('Refresh token expiré ou invalide');
        }
        // Injecter le refresh token pour utilisation dans le controller
        request['refreshToken'] = refreshToken;
      }

      return true;
    } catch (err) {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }
}
