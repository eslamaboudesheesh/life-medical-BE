/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { CounterModule } from 'src/common/counter/counter.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), CounterModule],
  controllers: [UsersController],
  providers: [UsersService, JwtService],
  exports:[UsersService]
})
export class UsersModule {}
