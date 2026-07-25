import { Signal, WritableSignal, computed, effect, signal } from '@angular/core';
import { Word } from '../model/words.model';

export interface ShuffledWordList {
  readonly shuffledWords: Signal<Word[]>;
  readonly actualIdx: Signal<number>;
  readonly actualWord: Signal<Word | undefined>;
  step(direction: number): void;
}

/**
 * Shared "shuffle a word list and step through it one at a time"
 * navigation used by Flashcards and Ask Words. Must be called from a
 * component/directive constructor (or another injection context), same as
 * a direct `effect()` call, since it registers one internally.
 */
export function createShuffledWordList(
  words: Signal<Word[]>,
  shuffle: (array: Word[]) => void,
  onReshuffle?: () => void,
): ShuffledWordList {
  const shuffledWords: WritableSignal<Word[]> = signal([]);
  const actualIdx = signal(0);

  effect(() => {
    const next = [...words()];
    shuffle(next);
    shuffledWords.set(next);
    actualIdx.set(0);
    onReshuffle?.();
  });

  function step(direction: number): void {
    actualIdx.update((currentIdx) => {
      const newIdx = currentIdx + direction;
      return newIdx >= 0 && newIdx < shuffledWords().length ? newIdx : currentIdx;
    });
  }

  return {
    shuffledWords: shuffledWords.asReadonly(),
    actualIdx: actualIdx.asReadonly(),
    actualWord: computed(() => shuffledWords()[actualIdx()]),
    step,
  };
}
