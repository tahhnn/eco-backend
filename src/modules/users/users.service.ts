import { Body, Injectable, InternalServerErrorException, Req, Res, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'express'
import * as  bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) { }

  async create(@Res() res: Response, @Body() data: CreateUserDto) {
    try {
      const existingEmail = await this.userModel.findOne({ email: data.email });
      const existingName = await this.userModel.findOne({ name: data.name })
      if (existingEmail) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Email đã được sử dụng',
          statusCode: HttpStatus.BAD_REQUEST
        });
      }
      if (existingName) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: "Tên đã được sử dụng",
          statusCode: HttpStatus.BAD_REQUEST
        })
      }

      const createdUser = new this.userModel({
        ...data,
        password: await this.hashPassword(data.password),
        role: "user",
        bio: "Have a nice day!",
        isPublicProfile: true,
        status: data.email && true || false,
      });
      const savedUser = await createdUser.save();
      return res.status(HttpStatus.CREATED).json({
        message: 'Tạo user thành công',
        data: savedUser,
        statusCode: HttpStatus.CREATED
      });

    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message,
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR

      });
    }
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
  async seed() {
    const demoUser = new this.userModel({
      email: 'boss@example.com',
      password: await this.hashPassword("123456"),
      name: 'Cho Cai',
      role: 'admin',
      avatar: '',
      address: 'Hà Nội',
      phone: '0123456789',
      status: false,
      bio: 'ngu, ngu, ngu',
    });
    await demoUser.save();
    return demoUser;
  }

  async hashPassword(password: string): Promise<string> {
    const round = 10;
    const hashedPassword = await bcrypt.hash(password, round)
    return hashedPassword
  }

}
