/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserRole } from './schemas/user.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
    ) { }

    // Create user inside a company
    async createUser(data: {
        name: string;
        email: string;
        password: string;
        role?: UserRole;
        company?: string; // optional for SUPER_ADMIN 
    }) {
        if (data.role === UserRole.SUPER_ADMIN) {
            // super admin must NOT belong to a company
            return this.userModel.create({
                name: data.name,
                email: data.email.toLowerCase(),
                password: data.password,
                role: UserRole.SUPER_ADMIN,
                company: null,
            });
        }

        if (!data.company) {
            throw new BadRequestException(
                'companyId is required for any non-super-admin user',
            );
        }

        return this.userModel.create({
            name: data.name,
            email: data.email.toLowerCase(),
            password: data.password,
            role: data.role ?? UserRole.EMPLOYEE,
            company: new Types.ObjectId(data.company),
        });
    }


    async findByEmail(email: string) {
        return this.userModel.findOne({ email: email.toLowerCase() });
    }

    async getUsersByCompany(companyId: string) {
        return this.userModel.find({
            company: companyId,
            role: { $ne: UserRole.SUPER_ADMIN }
        }).select('-password');
    }

    async findById(id: string): Promise<User | null> {
        const user = await this.userModel.findById(id);
        if (!user) throw new NotFoundException('User not found');
        return user;
    }


    async getAllUsers() {
        return this.userModel.find().select('-password');
    }

    async updateUserRole(userId: string, role: UserRole, companyId: string) {
        const user = await this.userModel.findOneAndUpdate(
            { _id: userId, company: companyId },
            { role },
            { new: true }
        );

        if (!user) throw new NotFoundException('User not found');
        return user;
    }


    async deleteUser(userId: string, companyId: string) {
        const deleted = await this.userModel.findOneAndDelete({
            _id: userId,
            company: companyId,
        });

        if (!deleted) throw new NotFoundException('User not found');
        return deleted;
    }


    async countUsers(): Promise<number> {
        return this.userModel.countDocuments();
    }
}
