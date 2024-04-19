import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CreateDto } from '../user/dto/create.dto';
import { Response } from 'express';
import * as process from 'node:process';
import { LoginDto } from '../user/dto/login.dto';
import { verify } from 'argon2';

@Injectable()
export class AuthService {
  EXPIRE_DAY_REFRESH_TOKEN = 1;
  REFRESH_TOKEN_NAME = 'refreshToken';

  constructor(
    private jwt: JwtService,
    private userService: UserService,
  ) {}

  async login(dto: LoginDto) {
    const { password, ...user } = await this.validateUser(dto);

    const tokens = await this.issueTokens(user.id);

    return {
      user,
      ...tokens,
    };
  }

  async register(dto: CreateDto) {
    const oldUser = await this.userService.getByEmail(dto.email);

    if (oldUser) throw new BadRequestException('User already exists');

    const { password, ...user } = await this.userService.create(dto);

    const tokens = await this.issueTokens(user.id);

    return {
      user,
      ...tokens,
    };
  }

  private async issueTokens(userId: string) {
    const data = { id: userId };

    const accessToken = this.jwt.sign(data, {
      expiresIn: '1h',
    });

    const refreshToken = this.jwt.sign(data, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  addRefreshTokenResponse(res: Response, refreshToken: string) {
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);

    res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
      //серверные куки, не будет показывать в браузере, должны быть в безопасности
      httpOnly: true,
      domain: 'localhost',
      // время окончания куки
      expires: expiresIn,
      //true if production
      secure: true,
      //lax if production
      sameSite: 'none',
    });
  }

  private async validateUser(dto: LoginDto) {
    const user = await this.userService.getByEmail(dto.email);

    if (!user) throw new NotFoundException('User not found');

    const isValid = await verify(user.password, dto.password);

    if (!isValid) throw new UnauthorizedException('Invalid password');

    return user;
  }

  removeRefreshTokenFromResponse(res: Response) {
    res.cookie(process.env.REFRESH_TOKEN_NAME, '', {
      //серверное куки, не будет показывать в браузере, должны быть в безопасности
      httpOnly: true,
      domain: 'localhost',
      // время окончания куки
      expires: new Date(0),
      //true if production
      secure: true,
      //lax if production
      sameSite: 'none',
    });
  }

  async getNewTokens(refreshToken: string) {
    const result = await this.jwt.verifyAsync(refreshToken);

    if (!result) throw new UnauthorizedException('Invalid refresh token');

    const { password, ...user } = await this.userService.getById(result.id);

    const tokens = await this.issueTokens(user.id);

    return {
      user,
      ...tokens,
    };
  }
}
