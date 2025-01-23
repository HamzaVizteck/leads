import { FieldType } from "../types";

export const detectFieldType = (value: any): FieldType => {
  if (
    value instanceof Date ||
    (typeof value === "string" && !isNaN(Date.parse(value)))
  ) {
    return "date";
  }
  if (
    typeof value === "number" ||
    (typeof value === "string" && !isNaN(Number(value)))
  ) {
    return "number";
  }
  if (typeof value === "boolean" || value === "true" || value === "false") {
    return "boolean";
  }
  return "string";
};

export const formatFieldValue = (value: any, type: FieldType): string => {
  if (value == null) return "";

  switch (type) {
    case "date":
      return value instanceof Date
        ? value.toLocaleDateString()
        : new Date(value).toLocaleDateString();
    case "number":
      return typeof value === "number"
        ? value.toLocaleString()
        : Number(value).toLocaleString();
    case "boolean":
      return value.toString();
    default:
      return String(value);
  }
};

export const parseFieldValue = (value: string, type: FieldType): any => {
  switch (type) {
    case "date":
      return new Date(value);
    case "number":
      return Number(value);
    case "boolean":
      return value === "true";
    default:
      return value;
  }
};

export const formatFieldLabel = (key: string): string => {
  return key
    .split(/(?=[A-Z])|_|-/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
