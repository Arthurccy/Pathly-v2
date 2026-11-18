import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum StatementFormat {
  CSV = 'CSV',
  OFX = 'OFX',
}

export class CsvMappingDto {
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  hasHeader?: boolean;

  @ApiPropertyOptional({ example: ';' })
  @IsOptional()
  @IsString()
  delimiter?: ';' | ',' | '\t' | '|';

  @ApiPropertyOptional({ example: 0, description: 'Index (0-based) ou nom de la colonne date' })
  @IsOptional()
  dateColumn?: number | string;

  @ApiPropertyOptional({ example: 1, description: 'Index (0-based) ou nom de la colonne libellé' })
  @IsOptional()
  descriptionColumn?: number | string;

  @ApiPropertyOptional({ example: 2, description: 'Index (0-based) ou nom de la colonne montant' })
  @IsOptional()
  amountColumn?: number | string;

  @ApiPropertyOptional({ example: 'YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  dateFormat?: string;

  @ApiPropertyOptional({ default: 'EUR' })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class ImportPreviewRequestDto {
  @ApiProperty({
    description: 'Contenu brut du fichier de relevé (CSV ou OFX)',
    example: 'date;libelle;montant\n2026-10-12;CB MONOPRIX PARIS;-42,50',
  })
  @IsString()
  @IsNotEmpty()
  rawContent!: string;

  @ApiPropertyOptional({
    enum: StatementFormat,
    default: StatementFormat.CSV,
    description: 'Format du relevé',
  })
  @IsOptional()
  @IsEnum(StatementFormat)
  format?: StatementFormat = StatementFormat.CSV;

  @ApiPropertyOptional({
    description: 'Séparateur CSV (auto-détecté par défaut)',
    example: ';',
  })
  @IsOptional()
  @IsString()
  delimiter?: ';' | ',' | '\t' | '|';

  @ApiPropertyOptional({
    description: 'Le fichier comporte-t-il une ligne d’en-tête ?',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  hasHeader?: boolean = true;

  @ApiPropertyOptional({
    description: 'Format attendu des dates (ex: YYYY-MM-DD ou DD/MM/YYYY)',
  })
  @IsOptional()
  @IsString()
  dateFormat?: string;

  @ApiPropertyOptional({
    description: 'Devise par défaut si absente du fichier',
    default: 'EUR',
  })
  @IsOptional()
  @IsString()
  currency?: string = 'EUR';

  @ApiPropertyOptional({
    description: 'Configuration optionnelle du mapping des colonnes',
    type: () => CsvMappingDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CsvMappingDto)
  mapping?: CsvMappingDto;
}

export class ImportCommitRequestDto extends ImportPreviewRequestDto {
  @ApiPropertyOptional({
    description: 'Identifiant UUID du compte bancaire cible dans Pathly (si omis, le compte est auto-créé)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  accountId?: string;

  @ApiPropertyOptional({
    description: 'Nom du compte à attribuer lors de l’auto-création si accountId est omis',
    example: 'Compte Courant Importé',
    default: 'Compte Relevé Importé',
  })
  @IsOptional()
  @IsString()
  accountName?: string;

  @ApiPropertyOptional({
    description: 'Solde actuel ou initial du compte renseigné par l’utilisateur (évite un faux solde à 0)',
    example: 1500.0,
  })
  @IsOptional()
  @IsNumber()
  initialBalance?: number;

  @ApiPropertyOptional({
    description: 'Si true, ignore silencieusement les transactions détectées comme réimportées',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  skipDuplicates?: boolean = true;
}
