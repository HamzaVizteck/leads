export type Lead = {
  id: number;
  [key: string]: any; // Allow dynamic fields
};

export type FieldType = "string" | "number" | "date" | "boolean";

export type Field = {
  key: string;
  label: string;
  type: FieldType;
};

export type Filter = {
  id: string;
  name: string;
  field: string; // Changed from keyof Lead to string to support dynamic fields
  type: "search" | "dropdown" | "number" | "date";
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
  isActive: boolean;
}

export interface DateCondition {
  operator: FilterOperator;
  value: string;
}

export interface FilterField {
  key: string;
  label: string;
  type: "search" | "dropdown" | "number" | "date";
  value?: string | string[] | NumberCondition[];
}

export interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
}
