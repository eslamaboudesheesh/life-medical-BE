/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { signupDto } from './dto/signup.dto';
import { signInDto } from './dto/signIn.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Auth') 
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  // ✅ Register endpoint
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    type: signupDto,
    description: 'User registration data',
    examples: {
      example1: {
        summary: 'Basic registration',
        value: {
          name: 'Eslam Aboudesheesh',
          email: 'eslam@gmail.com',
          password: '123456_Hell',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or email already exists' })
  register(@Body() body: signupDto) {
    return this.authService.register(body.name, body.email, body.password);
  }

  // ✅ Login endpoint
  @Post('login')
  @ApiOperation({ summary: 'Login and get access token' })
  @ApiBody({
    type: signInDto,
    description: 'User login credentials',
    examples: {
      example1: {
        summary: 'Valid user login',
        value: {
          email: 'eslam@gmail.com',
          password: '123456_Hell',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Returns access token.',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  login(@Body() body: signInDto) {
    return this.authService.login(body.email, body.password);
  }

  // ✅ Profile endpoint (Protected)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Get current logged-in user profile (requires token)' })
  @ApiResponse({
    status: 200,
    description: 'Returns the currently logged-in user details',
    schema: {
      example: {
        userId: '6737ac2f6a52b41...',
        email: 'eslam@gmail.com',
        role: 'ADMIN',
        iat: 1730989324,
        exp: 1730992924,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized. Token missing or invalid.' })
  getProfile(@Request() req) {
    return req.user;
  }
}
