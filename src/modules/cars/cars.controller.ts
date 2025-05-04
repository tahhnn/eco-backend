import { Controller, Get, UseGuards } from '@nestjs/common';
import { CarsService } from './cars.service';

import { AuthGuard } from '../auth/auth.guard';

@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) { }

  @UseGuards(AuthGuard)
  @Get('list')
  async getAllCar() {
    return this.carsService.getAllCar()
  }
}
