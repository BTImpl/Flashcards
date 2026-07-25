import { httpResource } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { SheetsResponse, Word } from '../model/words.model';

@Injectable({ providedIn: 'root' })
export class WordsApiService {
  apiKey = 'AIzaSyB0SXY42o9KsynxcOK1H4X5B4WIy8kUUls'; //TODO ezt ne rakd fel!!!!!
  sheetId = '11UCGxa7EAQf_xTrIB2dLQ2zBqiCKZ7SOIylishPYbgs';

  wordsResource(sheet: Signal<string>, range: Signal<string>) {
    return httpResource<Word[]>(
      () => ({
        url: `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${sheet()}!${range()}`,
        params: { key: this.apiKey },
      }),
      {
        parse: (raw) =>
          (raw as SheetsResponse).values.map(
            (row) =>
              ({
                en: row[0],
                hu: row[1],
              }) as Word,
          ),
        defaultValue: [],
      },
    );
  }
}
