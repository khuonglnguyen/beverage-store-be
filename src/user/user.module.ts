import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLoginEntity } from '../user-login/user-login.entity';
import { UserController } from './user.controller';
import { UserRepository } from '../user/user.repository';
import { UserService } from './user.service';
import { UserLoginRepository } from '../user-login/user-login.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserRepository,
      UserLoginRepository,
      UserLoginEntity,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserLoginRepository, JwtService],
  exports: [UserService],
})
export class UserModule {}
