import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO pour la connexion d'un utilisateur
 */
export class LoginDto {
  @ApiProperty({ 
    example: 'mamadou@example.com',
    description: 'Adresse email' 
  })
  @IsNotEmpty({ message: 'L\'email est requis' })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiProperty({ 
    example: 'Password123!',
    description: 'Mot de passe' 
  })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @IsString()
  password: string;
}
