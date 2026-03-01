import { IsEmail, IsOptional, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  email?: string;

  @IsOptional()
  phone?: string;

  @IsNotEmpty({ message: 'Mot de passe requis' })
  password: string;
}
