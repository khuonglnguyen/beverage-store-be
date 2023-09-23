import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  constructor(private readonly emanager: EntityManager) {
    super(UserEntity, emanager);
  }

  async isExistByEmail(email: string): Promise<boolean> {
    return !!(await this.count({ where: { email, isDeleted: false } }));
  }

  async findOneById(id: number): Promise<UserEntity> {
    return await this.findOne({ where: { id, isDeleted: false } });
  }

  async findOneByEmail(email: string): Promise<UserEntity> {
    return await this.findOne({ where: { email, isDeleted: false } });
  }
}
