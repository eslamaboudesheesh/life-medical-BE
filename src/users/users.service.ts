/* eslint-disable prettier/prettier */
import {  Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserRole } from 'src/users/schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CounterService } from 'src/common/counter/counter.service';



@Injectable()
export class UsersService {
    
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
            private counterService: CounterService,

    ) { }

    async createUser(name: string, email: string, password: string, role?: string ) {
        const nextUserId = await this.counterService.getNextSequence('userId');

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new this.userModel({ userId:nextUserId , name, email, password: hashedPassword, role });
        return newUser.save();

    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email });
    }



    async findById(userId: number): Promise<UserDocument | null> {
        const user = await this.userModel.findOne({ userId });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }


    async getAllUsers() {
        return this.userModel.find({}, '-password'); // exclude passwords
    }

    async updateUserRole(userId: number, role: UserRole) {
        return this.userModel.findByIdAndUpdate(userId, { role }, { new: true });
    }


    async deleteUser(userId: number) {
        const user = await this.userModel.findOneAndDelete({ userId });

        if (!user) throw new NotFoundException('User not found');

        return user;
    }

    async countUsers(): Promise<number> {
        return this.userModel.countDocuments();
    }

}


