import { Injectable } from '@angular/core';
import {buyersData, dailyData, data1, data2} from './lead-data';
import {interval} from 'rxjs';
import {map, startWith, take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  getLeads() {
    return interval(2000).pipe(
      take(10),
      startWith(0),
      map((i) => {
        if (i % 2 === 0) {
          return data2;
        } else {
          return data1;
        }
      })
    );
  }

  getBuyers() {
    return buyersData;
  }

  getDaily() {
    return dailyData;
  }
}
