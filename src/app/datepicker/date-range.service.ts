import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DateRangeService {

  dateSelected$ = new Subject<any>();
  dateUnselected$ = new Subject<any>();
  constructor() { }
}
