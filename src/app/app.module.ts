import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbDateAdapter, NgbDateParserFormatter, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { TableComponent } from './table/table.component';
import { TableRowsComponent } from './table/table-rows/table-rows.component';
import { DatepickerComponent } from './datepicker/datepicker.component';
import { NgbDateFRParserFormatter } from './datepicker/ngb-date-fr-parser-formatter';
import { NgbUTCStringAdapter } from './datepicker/ngb-UTC-string-adapter';
import { TableSortableDirective } from './table/table-sortable.directive';
import { DateFilterPipe } from './table/date-filter.pipe';

@NgModule({
  declarations: [
    AppComponent,
    TableComponent,
    TableRowsComponent,
    DatepickerComponent,
    TableSortableDirective,
    DateFilterPipe,
  ],
  imports: [
    BrowserModule,
    NgbModule,
    FormsModule
  ],
  providers: [
    {
      provide: NgbDateParserFormatter,
      useClass: NgbDateFRParserFormatter
    },
    {
      provide: NgbDateAdapter,
      useClass: NgbUTCStringAdapter
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
