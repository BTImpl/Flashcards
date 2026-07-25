export interface WordCardModel {
  value?: string;
  visible?: boolean;
  activeClass?: string;
  speakable?: boolean;
  lang?: string;
}

export const createSimpleWord = (val: string, spek: boolean):WordCardModel => ({
  value: val,
  visible: true,
  activeClass: 'bg-dark',
  speakable: spek
});
