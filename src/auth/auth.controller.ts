/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { signupDto } from './dto/signup.dto';
import { signInDto } from './dto/signIn.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() body: signupDto) {
    return this.authService.register(
      body.name,
      body.email,
      body.password,
    );
  }

  @Post('login')
  login(@Body() body: signInDto) {
    return this.authService.login(body.email, body.password);
    }
    
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}
