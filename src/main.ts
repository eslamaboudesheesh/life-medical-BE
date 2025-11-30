/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import mongoose from 'mongoose';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { UsersService } from './users/users.service';
import { UserRole } from './users/schemas/user.schema';

async function bootstrap() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('❌ Missing MONGO_URI');

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected');

    const app = await NestFactory.create(AppModule);

    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    });

    // ⭐⭐⭐ Added Multi-Tenant Host Resolver ⭐⭐⭐
    app.use((req: any, res, next) => {
      const host = req.headers.host; // e.g. ahmed.life-medical.com
      const [subdomain] = host.split('.');

      // If not main domain then treat as tenant subdomain
      if (subdomain && subdomain !== 'life-medical' && subdomain !== 'www') {
        req.companySubdomain = subdomain;
      }

      next();
    });

    // ---------------- SWAGGER ----------------
    const config = new DocumentBuilder()
      .setTitle('Life Medical API')
      .setDescription('Multi-Tenant backend for Life Medical')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);

    // ---------------- SEEDING -----------------
    const usersService = app.get(UsersService);
    const usersCount = await usersService.countUsers();

    if (usersCount === 0) {
      console.log('🚀 Seeding Super Admin...');
      await usersService.createUser({
        name: 'System Admin',
        email: 'admin@life-medical.com',
        password: 'Admin@123',
        role: UserRole.SUPER_ADMIN,
        company: null,
      });
      console.log('✅ Super Admin created!');
    }

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📘 Swagger available at http://localhost:${port}/api`);
  } catch (err) {
    console.error('❌ Error during startup:', err);
  }
}

bootstrap();
