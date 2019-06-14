import {Component, OnDestroy, OnInit, QueryList, ViewChildren} from '@angular/core';
import { Company } from '../models/item.model';
import {DataService} from '../data/data.service';
import {SortEvent, TableSortableDirective} from './table-sortable.directive';
import {map, takeUntil, tap} from 'rxjs/operators';
import {DateRangeService} from '../datepicker/date-range.service';
import {Subject} from 'rxjs';
import {DateFilterPipe} from './date-filter.pipe';

const compare = (v1, v2) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  providers: [DateFilterPipe]
})
export class TableComponent implements OnInit, OnDestroy {

  dimensions = [{
    name: 'Companies',
    value: 'companies'
  }, {
    name: 'Buyers',
    value: 'buyers'
  }, {
    name: 'Daily',
    value: 'baily'
  }];

  dimensions3;
  selectedDimension: {name} = this.dimensions[0];
  selectedSecondLayer: boolean;
  secondLayerData;
  thirdLayerData;
  dateModel: {
    fromDate: string,
    toDate: string
  };
  isSorted: SortEvent;
  destroy$ = new Subject();
  destroyFilter$ = new Subject();
  leads;
  calculatedLeads;
  totalLeads: number;
  expandedIndex: number;

  @ViewChildren(TableSortableDirective) headers: QueryList<TableSortableDirective>;

  constructor(
    private dataService: DataService,
    private dateRangeService: DateRangeService,
    private dateFilterPipe: DateFilterPipe
  ) {}

  ngOnInit() {
    this.getLeads();
    this.dateRangeService.dateSelected$.pipe(
      takeUntil(this.destroyFilter$)
    ).subscribe(
      (dateModel) => {
        this.dateModel = dateModel;
        this.leads = this.dateFilterPipe.transform([...this.calculatedLeads], dateModel);
      }
    );
    // this.expandedIndex = -1;
  }

  expandRow(index) {
    this.expandedIndex = index === this.expandedIndex ? -1 : index;
  }

  getLeads() {
    this.dataService.getLeads().pipe(
      takeUntil(this.destroy$),
      tap((leadsData) => this.totalLeads = this.getTotal(leadsData, 'leads') ),
      map((leadsData) => {
        return leadsData.map((lead) => this.patchLead(lead));
      })
    ).subscribe(
      data => {
        this.leads = data;
        // This line needed to store original data for sort
        this.calculatedLeads = [...this.leads];

        // means that we already applied dates filter or sort and as our data
        // comes from mocked ui not from server we need to apply that again on each update
        if (this.isSorted) {
          this.onSort(this.isSorted);
        }

        if (this.dateModel && this.dateModel.fromDate) {
          this.leads = this.dateFilterPipe.transform([...this.calculatedLeads], this.dateModel);
        }
      }
    );
  }

  patchLead(lead) {
    const updatedLead = {...lead, percentage: 0, revenue_full: 0, rpl: 0};
    updatedLead.percentage = this.totalLeads / lead.leads;
    updatedLead.revenue_full = lead.revenue_leads + lead.revenue_calls;
    updatedLead.rpl = lead.revenue_leads / lead.leads;
    return updatedLead;
  }

  mainDimensionChange(dimension) {
    this.selectedDimension = dimension;
    this.destroy$.next();
    if (dimension.name.toLowerCase() === 'companies') {
      this.getLeads();
      this.onSort({column: null, direction: ''});
      this.dateModel = {fromDate: '', toDate: ''};
      this.dateRangeService.dateUnselected$.next();
    } else if (dimension.name.toLowerCase() === 'buyers') {
      const rawData = this.dataService.getBuyers();
      this.resetDataOnSwitch(rawData);
    } else {
      const rawData = this.dataService.getDaily();
      this.resetDataOnSwitch(rawData);
    }
  }

  getLayerData(name) {
    return name === 'buyers' ? this.dataService.getBuyers() : this.dataService.getDaily();
  }

  resetDataOnSwitch(rawData) {
    this.totalLeads = this.getTotal(rawData, 'leads');
    this.leads = rawData.map((lead) => this.patchLead(lead));
    this.calculatedLeads = [...this.leads];
    this.onSort({column: null, direction: ''});
    this.dateRangeService.dateUnselected$.next();
  }

  round(num) {
    return Math.round(num * 10) / 10;
  }

  getTotal(arr, key: string) {
    return arr.reduce( (sum, curr) => sum + curr[key], 0 );
  }

  onSort({column, direction}: SortEvent) {
    // The same as for filter we need to remember our sort and reapply
    this.isSorted = {column, direction};
    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    // sorting leads
    if (direction === '') {
      this.leads = this.calculatedLeads;
    } else {
      this.leads = [...this.calculatedLeads].sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? res : -res;
      });
    }
  }

  secondLayerSelected(evt) {
    if (evt.target.value === 'null') {
      this.selectedSecondLayer = false;
      return;
    }
    this.dimensions3 = [...this.dimensions].filter((item) => {
      const name = item.name.toLowerCase();
      return name !== evt.target.value;
    });
    this.selectedSecondLayer = true;
    const rawData = this.getLayerData(evt.target.value);
    const totalLeads = this.getTotal(rawData, 'leads');
    this.secondLayerData = rawData.map((lead) => {
      const updatedLead = {...lead, percentage: 0, revenue_full: 0, rpl: 0};
      updatedLead.percentage = totalLeads / lead.leads;
      updatedLead.revenue_full = lead.revenue_leads + lead.revenue_calls;
      updatedLead.rpl = lead.revenue_leads / lead.leads;
      return updatedLead;
    });
  }

  thirdLayerSelected(evt) {
    if (evt.target.value === 'null') {
      this.thirdLayerData = [];
      return;
    }
    const rawData = this.getLayerData(evt.target.value);
    const totalLeads = this.getTotal(rawData, 'leads');
    this.thirdLayerData = rawData.map((lead) => {
      const updatedLead = {...lead, percentage: 0, revenue_full: 0, rpl: 0};
      updatedLead.percentage = totalLeads / lead.leads;
      updatedLead.revenue_full = lead.revenue_leads + lead.revenue_calls;
      updatedLead.rpl = lead.revenue_leads / lead.leads;
      return updatedLead;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroyFilter$.next();
  }
}
