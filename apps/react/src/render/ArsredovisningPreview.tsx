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
import { RenderBalansrakning } from "@/render/sections/RenderBalansrakning.tsx";

interface TaxonomyManagers {
  resultatrakning: TaxonomyManager;
  balansrakning: TaxonomyManager;
}

/**
 * A4-förhandsgranskning av årsredovisningen. Renderar resultaträkning +
 * balansräkning (fler sektioner tillkommer). Taxonomierna laddas asynkront.
 */
export function ArsredovisningPreview({
  arsredovisning,
}: {
  arsredovisning: Arsredovisning;
}) {
  const [managers, setManagers] = useState<TaxonomyManagers | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([
      getTaxonomyManager(TaxonomyRootName.RESULTATRAKNING_KOSTNADSSLAGSINDELAD),
      getTaxonomyManager(TaxonomyRootName.BALANSRAKNING),
    ]).then(([resultatrakning, balansrakning]) => {
      if (active) setManagers({ resultatrakning, balansrakning });
    });
    return () => {
      active = false;
    };
  }, []);

  if (!managers) {
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
        taxonomyManager={managers.resultatrakning}
      />
      <div className="page-break"></div>
      <RenderBalansrakning
        arsredovisning={arsredovisning}
        taxonomyManager={managers.balansrakning}
      />
    </div>
  );
}
