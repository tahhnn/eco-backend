import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards, Param } from '@nestjs/common';
import { CarsService } from './cars.service';

import { AuthGuard } from '../../common/guard/auth.guard';
import { CreateCarDto } from './dto/create-car.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/auth.decorator';
import { JwtPayload } from '../auth/contants';

@ApiTags("Car")
@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) { }

  @UseGuards(AuthGuard)
  @Get('list')
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Danh sách xe của user đang đăng nhập' })
  async getAllCar(@CurrentUser() user: JwtPayload) {
    return this.carsService.getAllOwnerCar(user)
  }


  @Get('user/:userId')
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Lấy thông tin user và danh sách xe của họ' })
  async getUserWithVehicles(@Param('userId') userId: string) {
    return this.carsService.getUserWithVehicles(userId);
  }

  @Post('add')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Tạo car' })
  @HttpCode(HttpStatus.CREATED)
  async createCar(@Body() payload: CreateCarDto, @CurrentUser() user: JwtPayload) {
    return this.carsService.createCar(payload, user);
  }
}
