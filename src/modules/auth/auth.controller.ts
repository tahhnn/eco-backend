import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginDto } from './dto/login.dto';
import { signInDTO } from './dto/signIn.dto';
import { UsersService } from '../users/users.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private UsersService: UsersService) { }
  
  @Post('login')
  login(@Body() payload: loginDto, @Res() res: Response) {
    return this.authService.login(payload, res);
  }
  @Post('register')
  register(@Body() payload: signInDTO, @Res() res: Response) {
    return this.UsersService.create(res, payload);
  }
}
