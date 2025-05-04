import { Module } from '@nestjs/common';
import { CarsService } from './cars.service';
import { CarsController } from './cars.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Car, CarSchema } from './cars.schema';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [CarsController],
  imports: [MongooseModule.forFeature([{ name: Car.name, schema: CarSchema }])],
  providers: [CarsService,JwtService],
})
export class CarsModule { }
