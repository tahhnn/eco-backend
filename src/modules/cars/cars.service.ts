import { Injectable } from '@nestjs/common';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Car } from './cars.schema';
import { Model } from 'mongoose';

@Injectable()
export class CarsService {
  constructor(@InjectModel(Car.name) private carModel: Model<Car>) { }
  async getAllCar() {
    try {
      const listCar = await this.carModel.find({})
      return {
        message: "Truy vấn thành công",
        data: listCar
      }
    } catch (error) {
      console.log(error)
      return {
        message: error,
      }
    }
  }

}
