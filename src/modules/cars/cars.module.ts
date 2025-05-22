import { Module } from '@nestjs/common';
import { CarsService } from './cars.service';
import { CarsController } from './cars.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Car, CarSchema } from './cars.schema';
import { JwtService } from '@nestjs/jwt';
import { User, UserSchema } from '../users/users.schema';

@Module({
  controllers: [CarsController],
  imports: [MongooseModule.forFeature([{ name: Car.name, schema: CarSchema }, { name: User.name, schema: UserSchema }])],
  providers: [CarsService, JwtService],
})
export class CarsModule { }
