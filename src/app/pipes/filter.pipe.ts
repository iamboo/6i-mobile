import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], field: string, value: string): any[] {
    if (!value || value === "") {
      return items;
    }
    if (!items) { return []; }
    return items.filter(it => it[field] && it[field].toLowerCase().indexOf(value.toLowerCase()) > -1);
  }

}