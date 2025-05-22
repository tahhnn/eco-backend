import { Controller, Get, Post, Body, Res, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Response } from 'express'
import { AuthGuard } from '../../common/guard/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('createUser')
  @ApiBearerAuth('access_token')
  create(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    return this.usersService.create(res, createUserDto);
  }

  @UseGuards(AuthGuard)
  @Get('list')
  @ApiBearerAuth('access_token')
  async findAll() {
    return this.usersService.findAll();
  }

  @Post('seed')
  async seed(@Res() res: Response): Promise<Response> {
    const user = await this.usersService.seed();
    return res.status(201).json({
      message: 'Seed user created successfully',
      data: user,
    });
  }

}
