import { User } from '../../generated/prisma/client';
import { UserEntity } from '../entities/user.entity';

export function toUserEntity(user: User): UserEntity {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
