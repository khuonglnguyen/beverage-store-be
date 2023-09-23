import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthenMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      try {
        const decoded = this.jwtService.verify(token, {
          secret: process.env.TOKEN_SECRET,
        });
        req['user'] = decoded;
      } catch (err) {
        return res
          .status(HttpStatus.FORBIDDEN)
          .json({ message: 'Token invalid' });
      }
    }
    next();
  }
}
