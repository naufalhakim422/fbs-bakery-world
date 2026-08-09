import 'server-only';

export type Locale = 'ms' | 'en' | 'id' | 'zh';

const dictionaries = {
  ms: () => import('@/dictionaries/ms.json').then((module) => module.default),
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
  id: () => import('@/dictionaries/id.json').then((module) => module.default),
  zh: () => import('@/dictionaries/zh.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  if (!dictionaries[locale]) {
    return dictionaries['ms']();
  }
  return dictionaries[locale]();
};
