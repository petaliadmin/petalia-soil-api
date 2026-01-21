import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../common/enums';

/**
 * DTO pour l'inscription d'un nouvel utilisateur
 */
export class RegisterDto {
  @ApiProperty({ 
    example: 'Mamadou Diallo',
    description: 'Nom complet' 
  })
  @IsNotEmpty({ message: 'Le nom complet est requis' })
  @IsString()
  fullName: string;

  @ApiProperty({ 
    example: 'mamadou@example.com',
    description: 'Adresse email' 
  })
  @IsNotEmpty({ message: 'L\'email est requis' })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiProperty({ 
    example: 'Password123!',
    description: 'Mot de passe (min 8 caractères)' 
  })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @IsString()
  password: string;

  @ApiProperty({ 
    example: '+221 77 123 45 67',
    description: 'Numéro de téléphone' 
  })
  @IsNotEmpty({ message: 'Le téléphone est requis' })
  @IsString()
  phone: string;

  @ApiProperty({ 
    example: UserRole.FARMER,
    enum: UserRole,
    description: 'Rôle de l\'utilisateur' 
  })
  @IsNotEmpty({ message: 'Le rôle est requis' })
  @IsEnum(UserRole, { message: 'Rôle invalide' })
  role: UserRole;
}
