import { useEffect, useMemo, useState } from "react";
import "@/render/render.scss";
import "@/render/renderComponents.scss";
import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import {
  getTaxonomyManager,
  type TaxonomyManager,
} from "@/util/TaxonomyManager.ts";
import {
  type TaxonomyItem,
  TaxonomyRootName,
} from "@/model/taxonomy/TaxonomyItem.ts";
import { RenderIXBRLHeader } from "@/render/sections/RenderIXBRLHeader.tsx";
import { RenderCover } from "@/render/sections/RenderCover.tsx";
import { RenderForvaltningsberattelse } from "@/render/sections/RenderForvaltningsberattelse.tsx";
import { RenderResultatrakning } from "@/render/sections/RenderResultatrakning.tsx";
import { RenderBalansrakning } from "@/render/sections/RenderBalansrakning.tsx";
import { RenderNoter } from "@/render/sections/RenderNoter.tsx";
import { RenderUnderskrifter } from "@/render/sections/RenderUnderskrifter.tsx";

interface TaxonomyManagers {
  forvaltningsberattelse: TaxonomyManager;
  resultatrakning: TaxonomyManager;
  balansrakning: TaxonomyManager;
  noter: TaxonomyManager;
}

/**
 * A4-förhandsgranskning av årsredovisningen: iXBRL-huvud + försättsblad +
 * resultaträkning + balansräkning + underskrifter. Förvaltningsberättelse och
 * noter tillkommer (kräver enum/tuple-belopprader). Taxonomierna laddas async.
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
      getTaxonomyManager(TaxonomyRootName.FORVALTNINGSBERATTELSE),
      getTaxonomyManager(TaxonomyRootName.RESULTATRAKNING_KOSTNADSSLAGSINDELAD),
      getTaxonomyManager(TaxonomyRootName.BALANSRAKNING),
      getTaxonomyManager(TaxonomyRootName.NOTER),
    ]).then(([forvaltningsberattelse, resultatrakning, balansrakning, noter]) => {
      if (active)
        setManagers({
          forvaltningsberattelse,
          resultatrakning,
          balansrakning,
          noter,
        });
    });
    return () => {
      active = false;
    };
  }, []);

  // Unika decimal-taxonomiobjekt över alla sektioner → enheter i huvudet.
  const decimalUnitItems = useMemo(() => {
    if (!managers) return [];
    return (Object.values(managers) as TaxonomyManager[])
      .flatMap((manager) =>
        manager
          .getRoot()
          .childrenFlat.filter(
            (item: TaxonomyItem) =>
              item.properties.type === "xbrli:decimalItemType",
          ),
      )
      .filter(
        (item: TaxonomyItem, i: number, arr: TaxonomyItem[]) =>
          arr.findIndex((other) => other.xmlName === item.xmlName) === i,
      );
  }, [managers]);

  if (!managers) {
    return (
      <div className="p-4 text-center text-sm text-ink-light">
        Laddar förhandsgranskning…
      </div>
    );
  }

  return (
    <div className="arsredovisning-root">
      <RenderIXBRLHeader
        arsredovisning={arsredovisning}
        decimalUnitItems={decimalUnitItems}
      />
      <RenderCover arsredovisning={arsredovisning} showFaststallelseintyg={false} />
      <div className="page-break"></div>
      <RenderForvaltningsberattelse
        arsredovisning={arsredovisning}
        taxonomyManager={managers.forvaltningsberattelse}
      />
      <div className="page-break"></div>
      <RenderResultatrakning
        arsredovisning={arsredovisning}
        taxonomyManager={managers.resultatrakning}
      />
      <div className="page-break"></div>
      <RenderBalansrakning
        arsredovisning={arsredovisning}
        taxonomyManager={managers.balansrakning}
      />
      <div className="page-break"></div>
      <RenderNoter
        arsredovisning={arsredovisning}
        taxonomyManager={managers.noter}
      />
      <RenderUnderskrifter arsredovisning={arsredovisning} />
    </div>
  );
}
