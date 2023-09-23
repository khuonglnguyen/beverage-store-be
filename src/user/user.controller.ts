import { Controller, Post, Body, Res } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { UserService } from './user.service';
import { UserLoginDTO, UserRefreshTokenDTO } from '../user/dto/user.dto';
import { RefreshTokenRO, UserLoginRO } from '../user/ro/user.ro';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiCreatedResponse({ type: UserLoginRO })
  @Post('/login')
  async create(@Body() user: UserLoginDTO, @Res() res: Response) {
    const result = await this.userService.login(user);
    return res.status(result.status).json(result.body);
  }

  @ApiCreatedResponse({ type: RefreshTokenRO })
  @Post('/refresh-token')
  async refreshToken(@Body() body: UserRefreshTokenDTO, @Res() res: Response) {
    const result = await this.userService.refreshToken(body);
    return res.status(result.status).json(result.body);
  }
}
