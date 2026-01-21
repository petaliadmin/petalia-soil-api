import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';

/**
 * Contrôleur d'authentification
 * Gère les endpoints d'inscription et de connexion
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Inscription d\'un nouvel utilisateur' })
  @ApiResponse({ 
    status: 201, 
    description: 'Utilisateur créé avec succès' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Email déjà utilisé' 
  })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Connexion d\'un utilisateur' })
  @ApiResponse({ 
    status: 200, 
    description: 'Connexion réussie' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Identifiants invalides' 
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
