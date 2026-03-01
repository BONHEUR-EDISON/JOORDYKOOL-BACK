import { IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'firstName est obligatoire' })
  firstName: string;

  @IsNotEmpty({ message: 'lastName est obligatoire' })
  lastName: string;

  @IsNotEmpty({ message: 'email est obligatoire' })
  @IsEmail({}, { message: 'email doit être valide' })
  email: string;

  @IsNotEmpty({ message: 'phone est obligatoire' })
  phone: string;

  @IsNotEmpty({ message: 'password est obligatoire' })
  @MinLength(8, { message: 'password doit avoir au moins 8 caractères' })
  password: string;

  @IsNotEmpty({ message: 'city est obligatoire' })
  city: string;

  @IsNotEmpty({ message: 'province est obligatoire' })
  province: string;

  @IsNotEmpty({ message: 'avatarUrl est obligatoire' })
  avatarUrl: string;
}
