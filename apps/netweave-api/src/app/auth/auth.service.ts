import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

export type AuthResponse = {
  access_token: string;
};

export type AuthPayload = {
  sub: number;
  email: string;
};

@Injectable()
export class AuthService {
  public constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  public async register(
    email: string,
    password: string,
  ): Promise<AuthResponse> {
    const existing = await this.userRepo.findOneBy({ email });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({ email, passwordHash });
    await this.userRepo.save(user);
    return this.sign(user);
  }

  public async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.userRepo.findOneBy({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      throw new UnauthorizedException('Invalid credentials');
    return this.sign(user);
  }

  public verifyToken(token: string): AuthPayload {
    try {
      return this.jwtService.verify<AuthPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid auth token');
    }
  }

  private sign(user: User): AuthResponse {
    return {
      access_token: this.jwtService.sign({ sub: user.id, email: user.email }),
    };
  }
}
