import { Module } from '@nestjs/common';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { CsvStatementParser } from './parsers/csv-statement-parser';
import { OfxStatementParser } from './parsers/ofx-statement-parser';

@Module({
  controllers: [ImportController],
  providers: [ImportService, CsvStatementParser, OfxStatementParser],
  exports: [ImportService],
})
export class ImportModule {}
