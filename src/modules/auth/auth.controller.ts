import { Controller, Get, Post, Body, Patch, Param, Delete, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginDto } from './dto/login.dto';
import { signInDTO } from './dto/signIn.dto';
import { UsersService } from '../users/users.service';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guard/auth.guard';
import { CurrentUser } from '../../common/decorator/auth.decorator';
import { JwtPayload } from './contants';

@ApiTags("Auth")
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private UsersService: UsersService) { }
  
  @Post('login')
  @ApiOperation({ summary: 'Login' })
  login(@Body() payload: loginDto, @Res() res: Response) {
    return this.authService.login(payload, res);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh token' })
  refreshToken(@Body('refresh_token') refreshToken: string, @Res() res: Response) {
    return this.authService.refreshToken(refreshToken, res);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register' })
  register(@Body() payload: signInDTO, @Res() res: Response) {
    return this.UsersService.create(res, payload);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Logout' })
  async logout(@CurrentUser() user: JwtPayload, @Res() res: Response) {
    return this.authService.logout(user, res);
  }

  @Post('verify-device')
  @ApiOperation({ summary: 'Xác thực thiết bị mới' })
  async verifyDevice(
    @Body('userId') userId: string,
    @Body('deviceId') deviceId: string,
    @Body('code') code: string,
    @Res() res: Response
  ) {
    return this.authService.verifyDevice(userId, deviceId, code, res);
  }

  @Post('test-email')
  @ApiOperation({ summary: 'Test email configuration' })
  async testEmail(@Res() res: Response) {
    return this.authService.sendTestEmail(res);
  }
}
