import { Injectable } from '@nestjs/common';

/** Date métier du jour (YYYY-MM-DD). Injectable pour rendre les tests déterministes. */
export abstract class BusinessClock {
  abstract today(): string;
}

@Injectable()
export class ParisBusinessClock extends BusinessClock {
  private readonly formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  today(): string {
    // en-CA formate en YYYY-MM-DD
    return this.formatter.format(new Date());
  }
}
