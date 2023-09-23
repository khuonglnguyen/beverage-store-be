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
      host: '127.0.0.1',
      port: 3306,
      username: 'root',
      password: 'aA123!@#',
      database: 'beverage-store',
      entities: [__dirname + '/**/*.entity{.js,.ts}'],
      // synchronize: true,
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
