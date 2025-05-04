import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { UsersService } from './modules/users/users.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('test/:id')
  @HttpCode(200)
  getTest(@Param('id') id: string): string {
    console.log(id); // sẽ in ra giá trị của :id trên URL
    return this.appService.getTest();
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

}
