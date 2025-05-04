import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { Request } from 'express';
  
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const req = context.switchToHttp().getRequest<Request>();
      const authHeader = req.headers['authorization'];
      const token = authHeader?.split(' ')[1];
  
      if (!token) {
        throw new UnauthorizedException('Token không tồn tại');
      }
  
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.SECRET_KEY,
        });
        req['user'] = payload;
        return true;
      } catch (error) {
        throw new UnauthorizedException('Token không hợp lệ');
      }
    }
  }
  