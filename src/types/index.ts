export type Lead = {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  industry: string;
  lastContact: string;
  value: number;
};

export type Filter = {
  id: string;
  field: keyof Lead;
  operator:
    | "equals"
    | "contains"
    | "greater"
    | "less"
    | "greaterEqual"
    | "lessEqual";
  value: string;
};

export type SavedFilter = {
  id: string;
  name: string;
  filters: Filter[];
};
