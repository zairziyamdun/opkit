import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty({ format: 'uuid' })
  readonly id: string;

  @ApiProperty({ example: 'user@example.com' })
  readonly email: string;

  @ApiProperty({ example: 'Jane Doe' })
  readonly name: string;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;
}
