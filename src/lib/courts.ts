/** Суды для анкеты (как opros.sot.kg/ru/court/{id}) */

export type Court = {
  id: number;
  nameRu: string;
  nameKy: string;
  regionRu?: string;
  regionKy?: string;
};

/** Стартовый каталог — id как в URL /court/1 */
export const COURTS: Court[] = [
  {
    id: 1,
    nameRu: "Верховный суд Кыргызской Республики",
    nameKy: "Кыргыз Республикасынын Жогорку соту",
    regionRu: "г. Бишкек",
    regionKy: "Бишкек ш.",
  },
  {
    id: 2,
    nameRu: "Бишкекский городской суд",
    nameKy: "Бишкек шаардык соту",
    regionRu: "г. Бишкек",
    regionKy: "Бишкек ш.",
  },
  {
    id: 3,
    nameRu: "Ошский городской суд",
    nameKy: "Ош шаардык соту",
    regionRu: "г. Ош",
    regionKy: "Ош ш.",
  },
  {
    id: 4,
    nameRu: "Чуйский областной суд",
    nameKy: "Чүй облустук соту",
    regionRu: "Чуйская область",
    regionKy: "Чүй облусу",
  },
  {
    id: 5,
    nameRu: "Иссык-Кульский областной суд",
    nameKy: "Ысык-Көл облустук соту",
    regionRu: "Иссык-Кульская область",
    regionKy: "Ысык-Көл облусу",
  },
  {
    id: 6,
    nameRu: "Ошский областной суд",
    nameKy: "Ош облустук соту",
    regionRu: "Ошская область",
    regionKy: "Ош облусу",
  },
  {
    id: 7,
    nameRu: "Джалал-Абадский областной суд",
    nameKy: "Жалал-Абад облустук соту",
    regionRu: "Джалал-Абадская область",
    regionKy: "Жалал-Абад облусу",
  },
  {
    id: 8,
    nameRu: "Баткенский областной суд",
    nameKy: "Баткен облустук соту",
    regionRu: "Баткенская область",
    regionKy: "Баткен облусу",
  },
];

export function getCourtById(id: number | string): Court | undefined {
  const n = typeof id === "string" ? parseInt(id, 10) : id;
  if (!Number.isFinite(n)) return undefined;
  return COURTS.find((c) => c.id === n);
}

export function courtLabel(c: Court, isKy: boolean): string {
  return isKy ? c.nameKy || c.nameRu : c.nameRu;
}
