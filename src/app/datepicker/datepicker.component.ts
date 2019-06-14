import {
  Component,
  ElementRef, OnDestroy,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';
import {
  NgbInputDatepicker,
  NgbDateStruct,
  NgbDateParserFormatter
} from '@ng-bootstrap/ng-bootstrap';
import {DateRangeService} from './date-range.service';
import {tap} from 'rxjs/operators';
import {Subscription} from 'rxjs';


const now = new Date();
const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
  one && two && two.year === one.year && two.month === one.month && two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day < two.day : one.month < two.month : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day > two.day : one.month > two.month : one.year > two.year;

@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.css']
})
export class DatepickerComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  startDate: NgbDateStruct;
  maxDate: NgbDateStruct;
  minDate: NgbDateStruct;
  hoveredDate: NgbDateStruct;
  fromDate: any;
  toDate: any;
  @ViewChild('d') input: NgbInputDatepicker;
  @ViewChild('myRangeInput') myRangeInput: ElementRef;

  isHovered = date =>
    this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);
  parseDate = (date: NgbDateStruct): string => this._parserFormatter.format(date);

  constructor(
    element: ElementRef,
    private renderer: Renderer2,
    private _parserFormatter: NgbDateParserFormatter,
    private dateRangeService: DateRangeService
  ) { }

  ngOnInit() {
    this.startDate = {year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate()};
    this.maxDate = { year: now.getFullYear() + 1, month: now.getMonth() + 1, day: now.getDate()};
    this.minDate = {year: now.getFullYear() - 1, month: now.getMonth() + 1, day: now.getDate()};
    this.subscription = this.dateRangeService.dateUnselected$.pipe(
      tap(() => this.renderer.setProperty(this.myRangeInput.nativeElement, 'value', ''))
    ).subscribe();
  }

  onDateSelection(date: NgbDateStruct) {
    let parsed = '';
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && after(date, this.fromDate)) {
      this.toDate = date;
      this.input.close();
    } else {
      this.toDate = null;
      this.fromDate = date;
    }

    if (this.fromDate) {
      parsed += this.parseDate(this.fromDate);
    }
    if (this.toDate) {
      parsed += ' - ' + this.parseDate(this.toDate);
    }

    this.dateRangeService.dateSelected$.next({
      fromDate: this.parseDate(this.fromDate),
      toDate: this.parseDate(this.toDate)
    });
    this.renderer.setProperty(this.myRangeInput.nativeElement, 'value', parsed);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
