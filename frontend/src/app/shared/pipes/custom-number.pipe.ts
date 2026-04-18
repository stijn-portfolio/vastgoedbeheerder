// src/app/shared/pipes/custom-number.pipe.ts

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customNumber',
  standalone: true
})
export class CustomNumberPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    return new Intl.NumberFormat('nl-NL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
}