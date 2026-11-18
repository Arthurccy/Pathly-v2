import { HttpException, Injectable, Inject } from '@nestjs/common';
import { Prisma, prisma } from '@pathly/database';
import type { UserProfileDto } from '@pathly/shared-types';

export const PROFILE_REPOSITORY = Symbol('PROFILE_REPOSITORY');
type ProfileRepository = Pick<typeof prisma.userProfile, 'findUnique' | 'create' | 'update'>;

@Injectable()
export class UsersService {
  constructor(
    @Inject(PROFILE_REPOSITORY) private readonly profiles: ProfileRepository,
  ) {}

  async getOrCreateProfile(user: { id: string; email?: string }): Promise<UserProfileDto> {
    let profile = await this.profiles.findUnique({ where: { id: user.id } });

    if (!profile) {
      if (!user.email) {
        throw new HttpException({
          success: false,
          error: {
            code: 'PROFILE_EMAIL_REQUIRED',
            message: 'Une adresse e-mail est nécessaire pour créer le profil.',
          },
        }, 422);
      }

      try {
        profile = await this.profiles.create({
          data: { id: user.id, email: user.email },
        });
      } catch (error: unknown) {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
          throw error;
        }

        profile = await this.profiles.findUnique({ where: { id: user.id } });
        if (!profile) {
          const emailOwner = await this.profiles.findUnique({ where: { email: user.email } });
          if (emailOwner) {
            throw new HttpException({
              success: false,
              error: {
                code: 'PROFILE_EMAIL_CONFLICT',
                message: 'Cette adresse e-mail est déjà associée à un autre profil.',
              },
            }, 409);
          }
          throw error;
        }
      }
    }

    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      createdAt: profile.createdAt.toISOString(),
    };
  }

  async updateProfile(user: { id: string; email?: string }, fullName: string): Promise<UserProfileDto> {
    await this.getOrCreateProfile(user);
    const profile = await this.profiles.update({
      where: { id: user.id },
      data: { fullName },
    });
    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      createdAt: profile.createdAt.toISOString(),
    };
  }
}
