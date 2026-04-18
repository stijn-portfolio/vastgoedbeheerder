// src/app/shared/pipes/capitalize-name.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalizeName',
  standalone: true
})
export class CapitalizeNamePipe implements PipeTransform {
  
  transform(value: string | null | undefined): string {
    if (!value) return '';
    
    // Verwijder extra spaties en splits de naam op
    const nameParts = value.trim().split(/\s+/);
    
    // Kapitaliseer elke naamdeel
    const capitalizedParts = nameParts.map(part => {
      if (part.length === 0) return part;
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    });
    
    return capitalizedParts.join(' ');
  }
}