import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { UsersService } from './modules/users/users.service';

@Controller('test')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('enter/:id')
  @HttpCode(200)
  getTest(@Param('id') id: string): string {
    return this.appService.getTest();
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

}
