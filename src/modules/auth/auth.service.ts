import { Injectable, Res } from '@nestjs/common';
import { loginDto } from './dto/login.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/users.schema';
import { Model } from 'mongoose';
import { Response } from 'express';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { JwtPayload } from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService
  ) {
    // Initialize nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      service: "gmail",
      secure: true,
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });

    // Test email configuration
    this.transporter.verify(function (error, success) {
      if (error) {
        console.log('Email configuration error:', error);
      } else {
        console.log('Email server is ready to send messages');
      }
    });
  }

  async login(payload: loginDto, @Res() res: Response) {
    const user = await this.userModel.findOne({ name: payload.username })
    if (!user) {
      return res.status(404).send({
        message: "User not found",
        status: 404
      })
    }
    const isPasswordValid = await this.validatePassword(payload.password, user.password)
    if (!isPasswordValid) {
      return res.status(404).send({
        message: "Password is incorrect",
        status: "404"
      })
    }

    // Check if device is already verified
    const isDeviceVerified = user.verifiedDevices.some(device => device.deviceId === payload.deviceId);

    if (!isDeviceVerified) {
      // Generate verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('Generated OTP:', verificationCode); // Debug log

      // Store verification code in cache with 10 minutes expiry
      const cacheKey = `verification:${user.id}:${payload.deviceId}`;
      await this.cacheManager.set(
        cacheKey,
        verificationCode,
        10 * 60 * 1000 // 10 minutes
      );

      // Verify the code was stored correctly
      const storedCode = await this.cacheManager.get(cacheKey);
      console.log('Stored OTP:', { cacheKey, storedCode }); // Debug log

      if (!storedCode) {
        return res.status(500).send({
          message: "Lỗi khi lưu mã xác thực",
          status: 500
        });
      }

      // Send verification email
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Xác thực thiết bị mới',
        html: `
          <h1>Xác thực thiết bị mới</h1>
          <p>Mã xác thực của bạn là: <strong>${verificationCode}</strong></p>
          <p>Mã này sẽ hết hạn sau 10 phút.</p>
        `,
      });

      return res.status(200).send({
        message: "Vui lòng kiểm tra email để xác thực thiết bị",
        requiresVerification: true,
        deviceId: payload.deviceId,
        userId: user._id
      });
    }

    // Device is verified, proceed with login
    const tokenPayload = { username: user.name, sub: user._id, role: user.role, public: user.isPublicProfile };
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(tokenPayload, { expiresIn: '15m' }),
      this.jwtService.signAsync(tokenPayload, { expiresIn: '7d' })
    ]);

    // Store refresh token in Redis
    await this.cacheManager.set(
      `refresh_token:${user._id}`,
      refresh_token,
      7 * 24 * 60 * 60 * 1000
    );

    return res.status(200).send({
      message: "Login Success",
      access_token,
      refresh_token
    });
  }

  async verifyDevice(userId: string, deviceId: string, code: string, @Res() res: Response) {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        return res.status(404).send({
          message: "User not found",
          status: 404
        });
      }

      // Get stored verification code
      const storedCode: any = await this.cacheManager.get(`verification:${userId}:${deviceId}`);
      console.log('Debug verification:', {
        inputCode: code,
        storedCode: storedCode,
        types: {
          inputType: typeof code,
          storedType: typeof storedCode
        }
      });

      // Convert both to string for comparison
      const inputCodeStr = String(code).trim();
      const storedCodeStr = String(storedCode).trim();

      if (!storedCode || inputCodeStr !== storedCodeStr) {
        return res.status(400).send({
          message: "Mã xác thực không hợp lệ hoặc đã hết hạn",
          status: 400,
          debug: {
            inputCode: inputCodeStr,
            storedCode: storedCodeStr,
            isMatch: inputCodeStr === storedCodeStr
          }
        });
      }

      // Add device to verified devices
      user.verifiedDevices.push({
        deviceId,
        verifiedAt: new Date()
      });
      await user.save();

      // Remove verification code from cache
      await this.cacheManager.del(`verification:${userId}:${deviceId}`);

      // Generate tokens
      const tokenPayload = { username: user.name, sub: user._id, role: user.role, public: user.isPublicProfile };
      const [access_token, refresh_token] = await Promise.all([
        this.jwtService.signAsync(tokenPayload, { expiresIn: '15m' }),
        this.jwtService.signAsync(tokenPayload, { expiresIn: '7d' })
      ]);

      // Store refresh token
      await this.cacheManager.set(
        `refresh_token:${user._id}`,
        refresh_token,
        7 * 24 * 60 * 60 * 1000
      );

      return res.status(200).send({
        message: "Xác thực thiết bị thành công",
        access_token,
        refresh_token
      });
    } catch (error) {
      return res.status(500).send({
        message: "Lỗi server",
        status: 500
      });
    }
  }

  async refreshToken(refreshToken: string, @Res() res: Response) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.SECRET_KEY,
      });

      const user = await this.userModel.findById(payload.sub);
      if (!user) {
        return res.status(401).send({
          message: "User not found",
          status: 401
        });
      }

      // Get stored refresh token from Redis
      const storedRefreshToken = await this.cacheManager.get(`refresh_token:${user._id}`);
      if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
        return res.status(401).send({
          message: "Invalid refresh token",
          status: 401
        });
      }

      const tokenPayload = { username: user.name, sub: user._id, role: user.role, public: user.isPublicProfile };
      const [newAccessToken, newRefreshToken] = await Promise.all([
        this.jwtService.signAsync(tokenPayload, { expiresIn: '15m' }),
        this.jwtService.signAsync(tokenPayload, { expiresIn: '7d' })
      ]);

      // Update refresh token in Redis
      await this.cacheManager.set(
        `refresh_token:${user._id}`,
        newRefreshToken,
        7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
      );

      return res.status(200).send({
        message: "Token refreshed successfully",
        access_token: newAccessToken,
        refresh_token: newRefreshToken
      });
    } catch (error) {
      return res.status(401).send({
        message: "Invalid refresh token",
        status: 401
      });
    }
  }

  async validatePassword(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
  }

  async logout(user: JwtPayload, @Res() res: Response) {
    try {
      // Remove refresh token from Redis
      await this.cacheManager.del(`refresh_token:${user.sub}`);

      // Clear deviceId from user
      await this.userModel.findByIdAndUpdate(user.sub, { deviceId: null });

      return res.status(200).send({
        message: "Logout successful",
        status: 200
      });
    } catch (error) {
      return res.status(500).send({
        message: "Error during logout",
        status: 500
      });
    }
  }

  async sendTestEmail(@Res() res: Response) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: 'Test Email Configuration',
        html: `
          <h1>Test Email</h1>
          <p>Nếu bạn nhận được email này, có nghĩa là cấu hình email đã hoạt động.</p>
        `,
      });

      return res.status(200).send({
        message: "Test email sent successfully",
        status: 200
      });
    } catch (error) {
      return res.status(500).send({
        message: "Error sending test email",
        error: error.message,
        status: 500
      });
    }
  }
}
