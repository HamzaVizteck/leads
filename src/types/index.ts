export type Lead = {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  industry: string;
  lastContact: Date;
  value: number;
};

export type Filter = {
  id: string;
  name: string;
  field: keyof Lead;
  type: "search" | "dropdown" | "number";
  value: string | number | string[] | NumberCondition[];
  dropdownOptions?: string[];
};

export type SavedFilter = {
  id: string;
  name: string;
  filters: Filter[];
};

export type FilterOperator = "=" | ">" | "<" | ">=" | "<=";

export interface NumberCondition {
  operator: FilterOperator;
  value: number;
}

export interface FilterField {
  key: keyof Lead;
  label: string;
  type: "search" | "dropdown" | "number";
  value?: string | string[] | NumberCondition[];
}
