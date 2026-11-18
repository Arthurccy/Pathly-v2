import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Matches, Min } from 'class-validator';

export class CashflowSummaryQuery {
  @ApiPropertyOptional({ example: '2026-10', description: 'Mois courant uniquement en S2 (défaut : mois courant, Europe/Paris)' })
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'month doit être au format YYYY-MM' })
  month?: string;

  @ApiPropertyOptional({
    example: 800,
    description: "Charges restant à débiter sur la période, en euros. Paramètre de simulation en S2 : absent → INCOMPLETE",
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 })
  @Min(0)
  remainingCommittedExpenses?: number;

  @ApiPropertyOptional({
    example: 200,
    description: "Réserve d'épargne à préserver, en euros. Paramètre de simulation en S2 : absent → INCOMPLETE",
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 })
  @Min(0)
  savingsReserve?: number;
}
