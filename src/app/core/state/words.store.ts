import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { WordsApiService } from '../../services/words-api.service';
import { LIST_TYPES, ListTypeEnum, UsersEnum } from '../../model/header.model';

interface WordsState {
  selectedSheet: string;
  selectedListType: ListTypeEnum;
}

const initialState: WordsState = {
  selectedSheet: UsersEnum.GABI,
  selectedListType: ListTypeEnum.UNKNOWN,
};

export const WordsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps((store) => {
    const apiService = inject(WordsApiService);
    return {
      _wordsResource: apiService.wordsResource(
        store.selectedSheet,
        computed(() => LIST_TYPES[store.selectedListType()].range),
      ),
    };
  }),
  withComputed(({ _wordsResource }) => ({
    words: computed(() => _wordsResource.value() ?? []),
  })),
  withMethods((store) => ({
    toggleUser(): void {
      patchState(store, {
        selectedSheet: store.selectedSheet() === UsersEnum.GABI ? UsersEnum.TOMI : UsersEnum.GABI,
      });
    },
    toggleListType(): void {
      patchState(store, {
        selectedListType:
          store.selectedListType() === ListTypeEnum.KNOWN ? ListTypeEnum.UNKNOWN : ListTypeEnum.KNOWN,
      });
    },
  })),
);
