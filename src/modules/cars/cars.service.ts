import { Body, HttpCode, HttpStatus, Injectable, Res } from '@nestjs/common';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Car } from './cars.schema';
import { Model } from 'mongoose';
import { Response } from 'express';
import { User } from '../users/users.schema';
import { JwtPayload } from '../auth/contants';

@Injectable()
export class CarsService {
  constructor(@InjectModel(Car.name) private carModel: Model<Car>, @InjectModel(User.name) private userModel: Model<User>) { }
  async getAllOwnerCar(user: JwtPayload) {
    try {
      const currentUserData = await this.userModel.findById(user.sub)
      if (!currentUserData) {
        return {
          message: "Không tồn tại người dùng"
        }
      }
      if (!currentUserData.isPublicProfile) {
        return {
          message: "Không người dùng không công khai"
        }
      }
      const listCar = await this.carModel.find({
        ownerId: user.sub,
      })
      if (listCar.length === 0) {
        return {
          message: "Không có giá trị"
        }
      }
      return {
        message: "Truy vấn thành công",
        data: listCar
      }
    } catch (error) {
      return {
        message: error,
      }
    }
  }


  async getUserWithVehicles(userId: string) {
    try {
      // Find user and check if they have public profile
      const user = await this.userModel.findById(userId);
      if (!user) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: "Không tìm thấy người dùng"
        };
      }

      if (!user.isPublicProfile) {
        return {
          statusCode: HttpStatus.FORBIDDEN,
          message: "Người dùng này không công khai thông tin"
        };
      }

      // Get user's vehicles
      const vehicles = await this.carModel.find({ ownerId: userId });

      // Return user info with their vehicles
      return {
        statusCode: HttpStatus.OK,
        message: "Lấy thông tin thành công",
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            address: user.address,
            phone: user.phone,
            bio: user.bio
          },
          vehicles: vehicles
        }
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Lỗi server",
        error: error.message
      };
    }
  }

  async createCar(payload: CreateCarDto, user: JwtPayload) {
    try {
      // Check if user exists
      const currentUser = await this.userModel.findById(user.sub);
      if (!currentUser) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: "Không tìm thấy người dùng"
        };
      }

      // Check if license plate already exists
      const isSamePlate = await this.carModel.findOne({ liscenscePlate: payload.liscenscePlate });
      if (isSamePlate) {
        return {
          statusCode: HttpStatus.CONFLICT,
          message: "Biển số xe đã tồn tại"
        };
      }

      // Create new car with owner ID from token
      const newCar = new this.carModel({
        ...payload,
        ownerId: user.sub,
        status: payload.status || 'available'
      });

      const savedCar = await newCar.save();
      return {
        statusCode: HttpStatus.CREATED,
        message: "Thêm xe thành công",
        data: savedCar
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Lỗi server",
        error: error.message
      };
    }
  }
  
  
}
