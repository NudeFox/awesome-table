import { Pipe, PipeTransform } from '@angular/core';

const toJsDate = (date: string) => {
  return new Date(date);
};

@Pipe({
  name: 'dateFilter'
})
export class DateFilterPipe implements PipeTransform {

  transform(value: any, dateModel: {fromDate: string, toDate: string}): any {
    if (value && value.length) {
      let itemsToFilter;

      if ( dateModel.fromDate) {
        itemsToFilter = value.filter(item => {
          if (toJsDate(item.date) >= toJsDate(dateModel.fromDate)) {
            return item;
          }
        });
      } else if (dateModel.fromDate && dateModel.toDate) {
        itemsToFilter = value.filter(item => {
          if (toJsDate(item.date) <= toJsDate(dateModel.toDate)) {
            return item;
          }
        });
      }
      return itemsToFilter;
    } else {
      return value;
    }
  }
}
