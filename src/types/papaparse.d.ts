declare module "papaparse" {
  export interface ParseResult<T> {
    data: T[];
    errors: ParseError[];
    meta: {
      delimiter: string;
      linebreak: string;
      aborted: boolean;
      truncated: boolean;
      cursor: number;
    };
  }

  export interface ParseError {
    type: string;
    code: string;
    message: string;
    row: number;
  }

  export interface ParseConfig<T> {
    delimiter?: string;
    newline?: string;
    quoteChar?: string;
    escapeChar?: string;
    header?: boolean;
    transformHeader?: (header: string) => string;
    dynamicTyping?: boolean;
    preview?: number;
    encoding?: string;
    worker?: boolean;
    comments?: boolean | string;
    complete?: (results: ParseResult<T>) => void;
    error?: (error: ParseError) => void;
    download?: boolean;
    skipEmptyLines?: boolean | "greedy";
    fastMode?: boolean;
    withCredentials?: boolean;
  }

  export function parse<T>(file: File, config?: ParseConfig<T>): void;
}

export default Papa;
