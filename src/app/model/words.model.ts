export interface Word {
  hu: string;
  en: string;
}

export interface SheetsResponse {
  range: string;
  majorDimension: string;
  values: string [][];
}
