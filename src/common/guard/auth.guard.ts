import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { Request } from 'express';
  import { CACHE_MANAGER } from '@nestjs/cache-manager';
  import { Inject } from '@nestjs/common';
  import { Cache } from 'cache-manager';
  
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(
      private readonly jwtService: JwtService,
      @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {}
  
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
        if (error.name === 'TokenExpiredError') {
          // Token đã hết hạn, kiểm tra refresh token
          const refreshToken = req.body.refresh_token;
          if (!refreshToken) {
            throw new UnauthorizedException('Access token đã hết hạn và không có refresh token');
          }
  
          try {
            // Verify refresh token
            const refreshPayload = await this.jwtService.verifyAsync(refreshToken, {
              secret: process.env.SECRET_KEY,
            });
  
            // Kiểm tra refresh token trong cache
            const storedRefreshToken = await this.cacheManager.get(`refresh_token:${refreshPayload.sub}`);
            if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
              throw new UnauthorizedException('Refresh token không hợp lệ');
            }
  
            // Tạo access token mới
            const newAccessToken = await this.jwtService.signAsync(
              { username: refreshPayload.username, sub: refreshPayload.sub, role: refreshPayload.role, public: refreshPayload.public },
              { expiresIn: '15m' }
            );
  
            // Gán token mới vào request
            req['user'] = refreshPayload;
            req['newAccessToken'] = newAccessToken;
            return true;
          } catch (refreshError) {
            throw new UnauthorizedException('Refresh token không hợp lệ');
          }
        }
        throw new UnauthorizedException('Token không hợp lệ');
      }
    }
  }
  