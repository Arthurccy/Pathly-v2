import {
  Controller,
  Body,
  Get,
  Header,
  Patch,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { ApiResponse, UserProfileDto } from '@pathly/shared-types';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileHttpExceptionFilter } from './profile-http-exception.filter';

interface AuthenticatedRequest extends Request {
  user: { id: string; email?: string };
}

@ApiTags('User profile')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@UseFilters(ProfileHttpExceptionFilter)
@Controller('me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  async getProfile(@Req() request: AuthenticatedRequest): Promise<ApiResponse<UserProfileDto>> {
    const data = await this.usersService.getOrCreateProfile(request.user);
    return { success: true, data };
  }

  @Patch()
  @Header('Cache-Control', 'no-store')
  async updateProfile(
    @Req() request: AuthenticatedRequest,
    @Body() input: UpdateProfileDto,
  ): Promise<ApiResponse<UserProfileDto>> {
    const data = await this.usersService.updateProfile(request.user, input.fullName);
    return { success: true, data };
  }
}
