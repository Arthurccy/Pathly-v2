import { Module } from '@nestjs/common';
import { prisma } from '@pathly/database';
import { UsersController } from './users.controller';
import { PROFILE_REPOSITORY, UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    { provide: PROFILE_REPOSITORY, useValue: prisma.userProfile },
  ],
})
export class UsersModule {}
