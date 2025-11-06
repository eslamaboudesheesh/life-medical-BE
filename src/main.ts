/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { UserRole } from './users/schemas/user.schema';
import mongoose from 'mongoose';

async function bootstrap() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('❌ Missing MONGO_URI in environment variables');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected');

    const app = await NestFactory.create(AppModule);

    app.enableCors({
      origin: '*', 
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    });

    const usersService = app.get(UsersService);
    const usersCount = await usersService.countUsers();

    if (usersCount === 0) {
      console.log('🚀 No users found, seeding initial admin...');
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@life-medical.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
      const adminName = process.env.ADMIN_NAME || 'System Admin';

      await usersService.createUser(
        adminName,
        adminEmail,
        adminPassword,
        UserRole.ADMIN,
      );
      console.log(`✅ Admin ${adminEmail} created successfully!`);
    } else {
      console.log(`ℹ️ ${usersCount} users found. Skipping seeding.`);
    }

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Server running on port ${port}`);
  } catch (err) {
    console.error('❌ Error during app startup:', err);
  }
}

bootstrap();
