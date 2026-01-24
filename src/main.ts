import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors';
import { HttpExceptionFilter } from './common/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);

  // Activer CORS
  app.enableCors({
    origin: '*', // En production, spécifier les domaines autorisés
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Intercepteur global pour formater les réponses
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Filtre global pour les exceptions
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle(configService.get<string>('API_TITLE') || 'AgriLand API')
    .setDescription(
      configService.get<string>('API_DESCRIPTION') || 
      'API REST pour plateforme agricole avec géolocalisation. ' +
      'Permet de publier des annonces de terres agricoles, gérer les paramètres du sol, ' +
      'visualiser les terres sur une carte et obtenir des recommandations de cultures.'
    )
    .setVersion(configService.get<string>('API_VERSION') || '1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Entrez votre token JWT',
        in: 'header',
      },
      'JWT',
    )
    .addTag('Authentication', 'Endpoints d\'inscription et de connexion')
    .addTag('Users', 'Gestion des utilisateurs')
    .addTag('Lands', 'Gestion des terres agricoles')
    .addTag('Recommendations', 'Recommandations de cultures')
    .addTag('Contact', 'Mise en relation propriétaires-agriculteurs')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'AgriLand API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🌾 AgriLand API - Backend NestJS                   ║
║                                                       ║
║   ✅ Server running on: http://localhost:${port}       ║
║   📚 Swagger Docs: http://localhost:${port}/api       ║
║   🗄️  Database: MongoDB Atlas                         ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
}

bootstrap();
