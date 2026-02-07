export interface GlossaryEntry {
  term: string;
  short: string;
  long: string;
  citation?: string;
}

export type GlossarySlug = string;
export type GlossaryMap = Record<GlossarySlug, GlossaryEntry>;
