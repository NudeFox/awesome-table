export class CompanyDimension {
  companies: Company[];
  total: Company;
}

export class Company {
  name: string;
  leads: number;
  percentage: number;
  revenue_leads: number;
  revenue_calls: number;
  revenue_full: number;
  cost: number;
  p_lead: number;
  roi: number;
  cpl: number;
  rpl: number;
  date: string;
}
