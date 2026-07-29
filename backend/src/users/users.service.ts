import { Injectable } from '@nestjs/common';
import { User } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserData } from './types/create-user-data.interface';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateUserData): Promise<User> {
    return this.prismaService.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }

  async updatePasswordHash(
    userId: string,
    passwordHash: string,
  ): Promise<User> {
    return this.prismaService.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }
}
