import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { CreateDto } from '../user/dto/create.dto';
import { Response, Request } from 'express';
import { LoginDto } from '../user/dto/login.dto';
import * as process from 'process';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...response } = await this.authService.login(dto);

    this.authService.addRefreshTokenResponse(res, refreshToken);

    return response;
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('register')
  async register(
    @Body() dto: CreateDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...response } = await this.authService.register(dto);

    this.authService.addRefreshTokenResponse(res, refreshToken);

    return response;
  }

  @HttpCode(200)
  @Post('login/access-token')
  async getNewTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshTokenFromCookies = req.cookies[process.env.REFRESH_TOKEN_NAME];

    if (!refreshTokenFromCookies) {
      this.authService.removeRefreshTokenFromResponse(res);
      throw new UnauthorizedException('Refresh token not passed');
    }

    const { refreshToken, ...response } = await this.authService.getNewTokens(
      refreshTokenFromCookies,
    );

    this.authService.addRefreshTokenResponse(res, refreshToken);

    return response;
  }

  @HttpCode(200)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    this.authService.removeRefreshTokenFromResponse(res);

    return true;
  }
}
