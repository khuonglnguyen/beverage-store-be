import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthenMiddleware } from 'common/middleware/authen.middleware';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'MYSQL8002.site4now.net',
      port: 3306,
      username: 'a9e54f_victorn',
      password: 'aA123!@#',
      database: 'db_a9e54f_victorn',
      entities: [__dirname + '/**/*.entity{.js,.ts}'],
      synchronize: true,
      logging: true,
    }),
    UserModule,
    JwtModule.register({
      secret: process.env.TOKEN_SECRET,
    }),
    ConfigModule.forRoot(),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenMiddleware)
      .forRoutes({ path: '/user/logout', method: RequestMethod.DELETE });
  }
}
