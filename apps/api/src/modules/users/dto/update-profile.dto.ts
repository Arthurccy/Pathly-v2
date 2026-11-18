import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import type { UpdateProfileDto as SharedUpdateProfileDto } from '@pathly/shared-types';

export class UpdateProfileDto implements SharedUpdateProfileDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName!: string;
}
