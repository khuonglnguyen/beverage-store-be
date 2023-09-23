import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_login')
export class UserLoginEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'access_token', length: 512, nullable: false })
  accessToken: string;

  @Column({ name: 'refresh_token', length: 512, nullable: false })
  refreshToken: string;

  @Column({ name: 'is_used', nullable: false, default: false })
  isUsed: boolean;

  @Column({ name: 'user_id', nullable: false })
  userId: number;
}
