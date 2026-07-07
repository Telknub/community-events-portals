import type en from "./dictionary.json";

type DictionaryTranslationKeys = keyof typeof en;
type FestivalOfColorsTranslationKeys = Extract<
  DictionaryTranslationKeys,
  `festival-of-colors.${string}`
>;
type Colors2026TranslationKeys =
  FestivalOfColorsTranslationKeys extends `festival-of-colors.${infer Key}`
    ? `colors-2026.${Key}`
    : never;

export type TranslationKeys =
  DictionaryTranslationKeys | Colors2026TranslationKeys;
