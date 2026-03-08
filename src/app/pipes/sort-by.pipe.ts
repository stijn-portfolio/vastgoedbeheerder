import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortBy',
  standalone: true
})
export class SortByPipe implements PipeTransform {
  transform<T>(array: T[], field: keyof T, descending = false): T[] {
    if (!array || !field) {
      return array;
    }

    // Maak een kopie van de array om te voorkomen dat we de originele wijzigen
    const sortedArray = [...array];

    sortedArray.sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];
      
      if (aValue < bValue) {
        return descending ? 1 : -1;
      } else if (aValue > bValue) {
        return descending ? -1 : 1;
      }
      return 0;
    });

    return sortedArray;
  }
}