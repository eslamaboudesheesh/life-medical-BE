/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { UserRole } from './users/schemas/user.schema';

async function bootstrap() {
  console.log('🚀 Starting manual seed...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@life-medical.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const adminName = process.env.ADMIN_NAME || 'System Admin';

  const adminExists = await usersService.findByEmail(adminEmail);

  if (adminExists) {
    console.log(`⚠️ Admin already exists: ${adminEmail}`);
  } else {
    await usersService.createUser(
      adminName,
      adminEmail,
      adminPassword,
      UserRole.ADMIN,
    );
    console.log(`✅ Admin created successfully: ${adminEmail}`);
  }

  await app.close();
  console.log('🏁 Seeding process finished.');
}

bootstrap().catch((err) => {
  console.error('❌ Error running seed script:', err);
});
