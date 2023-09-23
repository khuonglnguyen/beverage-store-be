import { EntityManager, QueryRunner, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UserLoginEntity } from './user-login.entity';

@Injectable()
export class UserLoginRepository extends Repository<UserLoginEntity> {
  constructor(private readonly emanager: EntityManager) {
    super(UserLoginEntity, emanager);
  }

  async store(userLogin: UserLoginEntity) {
    return await this.save(userLogin);
  }

  async storeWithTransaction(
    queryRunner: QueryRunner,
    userLogin: UserLoginEntity,
  ) {
    return await queryRunner.manager
      .getRepository(UserLoginEntity)
      .save(userLogin);
  }

  async getByRefreshToken(refreshToken: string) {
    return await this.findOne({ where: { refreshToken } });
  }

  async deleteByUser(userId: number) {
    return await this.createQueryBuilder('user_login')
      .delete()
      .from(UserLoginEntity)
      .where('user_login.user_id = :userId', { userId })
      .execute();
  }

  async updateIsUsedByIdWithTransaction(queryRunner: QueryRunner, id: number) {
    return await queryRunner.manager
      .getRepository(UserLoginEntity)
      .createQueryBuilder()
      .update(UserLoginEntity)
      .set({ isUsed: true })
      .where('id = :id', { id })
      .execute();
  }

  async findByUserId(userId: number) {
    return await this.findOne({ where: { userId } });
  }
}
