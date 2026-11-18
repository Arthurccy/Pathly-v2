import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export const TRANSACTIONS_DEFAULT_LIMIT = 50;
export const TRANSACTIONS_MAX_LIMIT = 100;

export class ListTransactionsQuery {
  @ApiPropertyOptional({ minimum: 1, maximum: TRANSACTIONS_MAX_LIMIT, default: TRANSACTIONS_DEFAULT_LIMIT })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(TRANSACTIONS_MAX_LIMIT)
  limit?: number;

  @ApiPropertyOptional({ description: 'Identifiant de la dernière transaction de la page précédente' })
  @IsOptional()
  @IsUUID()
  cursor?: string;
}
