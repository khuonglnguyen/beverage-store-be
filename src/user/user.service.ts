import { JwtService } from '@nestjs/jwt';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserLoginEntity } from '../user-login/user-login.entity';
import { UserRepository } from '../user/user.repository';
import { UserLoginRepository } from '../user-login/user-login.repository';
import { BaseService } from '../services/base.service';
import { UserLoginDTO, UserRefreshTokenDTO } from './dto/user.dto';
import { plainToInstance } from 'class-transformer';
import { UserLoginRO } from './ro/user.ro';
import { EntityManager } from 'typeorm';

@Injectable()
export class UserService extends BaseService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userLoginRepository: UserLoginRepository,
    private readonly jwt: JwtService,
  ) {
    super();
  }

  async login(body: UserLoginDTO) {
    const userFound = await this.userRepository.findOneByEmail(body.email);
    if (!userFound) {
      return this.formatData(HttpStatus.UNAUTHORIZED, {
        message: 'Email or password is incorrect',
      });
    }

    const match = await bcrypt.compare(body.password, userFound.password);
    if (!match) {
      return this.formatData(HttpStatus.UNAUTHORIZED, {
        message: 'Email or password is incorrect',
      });
    }

    const userData = {
      id: userFound.id,
      fullName: userFound.fullName,
      email: userFound.email,
    };

    const accessToken = await this.generateToken(
      userData,
      process.env.ACCESS_TOKEN_LIFE,
    );

    const refreshToken = await this.generateToken(
      userData,
      process.env.REFRESH_TOKEN_LIFE,
    );

    const userLoginEntity = new UserLoginEntity();
    userLoginEntity.accessToken = accessToken;
    userLoginEntity.refreshToken = refreshToken;
    userLoginEntity.userId = userFound.id;
    await this.userLoginRepository.store(userLoginEntity);

    return this.formatData(
      HttpStatus.CREATED,
      plainToInstance(UserLoginRO, userLoginEntity, {
        excludeExtraneousValues: true,
      }),
    );
  }

  private async generateToken(userData: any, tokenLife: string) {
    return await this.jwt.signAsync(
      {
        data: userData,
      },
      { secret: process.env.TOKEN_SECRET, expiresIn: tokenLife },
    );
  }

  async refreshToken(body: UserRefreshTokenDTO) {
    const userLoginFound = await this.userLoginRepository.getByRefreshToken(
      body.refreshToken,
    );
    if (!userLoginFound) {
      return this.formatData(HttpStatus.FORBIDDEN, {
        message: 'Invalid refresh token',
      });
    }
    if (userLoginFound.isUsed) {
      await this.userLoginRepository.deleteByUser(userLoginFound.userId);
      return this.formatData(HttpStatus.FORBIDDEN, {
        message: 'Invalid refresh token',
      });
    }

    let userLoginEntity: UserLoginEntity;
    await this.userLoginRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        await transactionalEntityManager.queryRunner.startTransaction();
        try {
          await this.userLoginRepository.updateIsUsedByIdWithTransaction(
            transactionalEntityManager.queryRunner,
            userLoginFound.id,
          );

          const userData = this.decodeToken(userLoginFound.refreshToken);
          const accessToken = await this.generateToken(
            userData['data'],
            process.env.ACCESS_TOKEN_LIFE,
          );
          const refreshToken = await this.generateToken(
            userData['data'],
            process.env.REFRESH_TOKEN_LIFE,
          );

          userLoginEntity = new UserLoginEntity();
          userLoginEntity.accessToken = accessToken;
          userLoginEntity.refreshToken = refreshToken;
          userLoginEntity.userId = userData['data']['id'];

          await this.userLoginRepository.storeWithTransaction(
            transactionalEntityManager.queryRunner,
            userLoginEntity,
          );

          await transactionalEntityManager.queryRunner.commitTransaction();
        } catch (error) {
          Logger.error(error);
          await transactionalEntityManager.queryRunner.rollbackTransaction();
        }
      },
    );

    return this.formatData(
      HttpStatus.CREATED,
      plainToInstance(UserLoginRO, userLoginEntity, {
        excludeExtraneousValues: true,
      }),
    );
  }

  private async verifyToken(token: string) {
    return await this.jwt.verifyAsync(token, {
      secret: process.env.TOKEN_SECRET,
    });
  }

  private decodeToken(token: string) {
    return this.jwt.decode(token);
  }
}
