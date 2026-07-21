import type { TaxonomyItem } from "@/model/taxonomy/TaxonomyItem.ts";

/** En not (grupp) i navigeringsträdet. */
export interface NoterNavNote {
  xmlName: string;
  label: string;
}

/** En kategori (grupp av grupper) med sina noter. */
export interface NoterNavCategory {
  xmlName: string;
  label: string;
  notes: NoterNavNote[];
}

/**
 * Härleder trädstrukturen kategori → noter ur noter-taxonomins rot. Samma
 * nivåer som EditNoter renderar: `root.children[0].children` är kategorierna
 * (groupsOfGroups) och varje kategoris `children` är noterna (groups). Ankaren
 * i EditNoter har id `noter-${group.xmlName}`, så samma xmlName används här.
 */
export function deriveNoterCategories(
  root: TaxonomyItem,
): NoterNavCategory[] {
  const categories = root.children[0]?.children ?? [];
  return categories.map((category) => ({
    xmlName: category.xmlName,
    label: category.additionalData.displayLabel ?? "",
    notes: category.children.map((note) => ({
      xmlName: note.xmlName,
      label: note.additionalData.displayLabel ?? "",
    })),
  }));
}
