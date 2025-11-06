/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

    async register(name: string, email: string, password: string, role?: string) {
        const usersCount = await this.usersService.countUsers(); 
        let assignedRole = 'employee';

        if (usersCount === 0) {
            assignedRole = 'admin'; 
        } else if (role && role === 'manager') {
            assignedRole = 'manager';
        }

        const user = await this.usersService.createUser(name, email, password, assignedRole);
        return this.generateToken(user);
    }


  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return this.generateToken(user);
  }

  private generateToken(user: any) {
    const payload = { sub: user._id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
