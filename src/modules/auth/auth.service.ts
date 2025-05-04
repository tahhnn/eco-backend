import { Injectable, Res } from '@nestjs/common';
import { loginDto } from './dto/login.dto';
import { signInDTO } from './dto/signIn.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/users.schema';
import { Model } from 'mongoose';
import { Response } from 'express';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>, private jwtService: JwtService
  ) { }

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
    const tokenPayload = { username: user.name, sub: user._id };
    const token = await this.jwtService.signAsync(tokenPayload);
        return res.status(200).send({
      message: "Login Success",
      access_token: token
    })
  }
  async validatePassword(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
  }
}
