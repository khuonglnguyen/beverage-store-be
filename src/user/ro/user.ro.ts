import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserLoginRO {
  @ApiProperty()
  @Expose()
  userId: number;

  @ApiProperty()
  @Expose()
  accessToken: string;

  @ApiProperty()
  @Expose()
  refreshToken: string;
}

export class RefreshTokenRO extends UserLoginRO {}
