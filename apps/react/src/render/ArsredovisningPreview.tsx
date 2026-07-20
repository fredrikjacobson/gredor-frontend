import { useEffect, useState } from "react";
import "@/render/render.scss";
import "@/render/renderComponents.scss";
import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import {
  getTaxonomyManager,
  type TaxonomyManager,
} from "@/util/TaxonomyManager.ts";
import { TaxonomyRootName } from "@/model/taxonomy/TaxonomyItem.ts";
import { RenderResultatrakning } from "@/render/sections/RenderResultatrakning.tsx";

/**
 * A4-förhandsgranskning av årsredovisningen. Renderar just nu resultaträkningen
 * (fler sektioner tillkommer). Taxonomin laddas asynkront.
 */
export function ArsredovisningPreview({
  arsredovisning,
}: {
  arsredovisning: Arsredovisning;
}) {
  const [taxonomyManager, setTaxonomyManager] =
    useState<TaxonomyManager | null>(null);

  useEffect(() => {
    let active = true;
    void getTaxonomyManager(
      TaxonomyRootName.RESULTATRAKNING_KOSTNADSSLAGSINDELAD,
    ).then((manager) => {
      if (active) setTaxonomyManager(manager);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!taxonomyManager) {
    return (
      <div className="p-4 text-center text-sm text-ink-light">
        Laddar förhandsgranskning…
      </div>
    );
  }

  return (
    <div className="arsredovisning-root">
      <RenderResultatrakning
        arsredovisning={arsredovisning}
        taxonomyManager={taxonomyManager}
      />
    </div>
  );
}
