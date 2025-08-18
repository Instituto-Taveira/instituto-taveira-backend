import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { DomainExceptionFilter } from './common/filters/domain-exception.filter';

async function bootstrap() {
      const app = await NestFactory.create(AppModule);

      app.use(json({ limit: '50mb' }));

      app.use(urlencoded({ extended: true, limit: '50mb' }));
      // app.useGlobalFilters(new DomainExceptionFilter());

      const config = new DocumentBuilder()
            .setTitle('Instituto Taverna API')
            .setDescription('API do instituto taverna')
            .setVersion('1.2')
            .addTag('Auth', 'Métodos para autenticação de usuários')
            .addBearerAuth({
                  type: 'http',
                  scheme: 'bearer',
                  bearerFormat: 'JWT',
            })
            .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('swagger', app, document, {
            swaggerOptions: {
                  persistAuthorization: true,
            },
      });

      app.enableCors({
            allowedHeaders: '*',
            origin: '*',
      });

      await app.listen(process.env.PORT || 3000, () => {
            console.log(`🤖 server running on port ${process.env.PORT}...`);
            console.log(
                  `🚀 Swagger running on http://localhost:${process.env.PORT}/swagger`,
            );
      });
}
bootstrap();
