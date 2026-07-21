import { useEffect, useMemo, useState } from "react";
import "@/edit/belopprad/editBelopprad.scss";
import type { TaxonomyItem } from "@/model/taxonomy/TaxonomyItem.ts";
import { TaxonomyRootName } from "@/model/taxonomy/TaxonomyItem.ts";
import {
  getTaxonomyManager,
  type TaxonomyManager,
} from "@/util/TaxonomyManager.ts";
import { useArsredovisningStore } from "@/stores/arsredovisningStore.ts";
import { BeloppradEditContext } from "@/edit/belopprad/BeloppradEditContext.ts";
import { usePrepopulateSection } from "@/edit/belopprad/usePrepopulateSection.ts";
import { groupPool } from "@/edit/belopprad/prepopulate.ts";
import { EditBelopprad } from "@/edit/belopprad/EditBelopprad.tsx";
import { EditGroup } from "@/edit/EditGroup.tsx";
import {
  ScrollspySection,
  type ScrollspyGroup,
} from "@/edit/ScrollspySection.tsx";
import { EditForvaltningsberattelseFlerarsoversikt } from "@/edit/sections/forvaltningsberattelse/EditForvaltningsberattelseFlerarsoversikt.tsx";

const FLERARSOVERSIKT = "se-gen-base:Flerarsoversikt";
const FORANDRING_EGET_KAPITAL = "se-gen-base:ForandringEgetKapital";

/** Port av EditForvaltningsberattelse.vue. */
export function EditForvaltningsberattelse() {
  const arsredovisning = useArsredovisningStore((s) => s.arsredovisning);
  useArsredovisningStore((s) => s.revision);
  const [taxonomyManager, setTaxonomyManager] = useState<TaxonomyManager | null>(
    null,
  );

  useEffect(() => {
    let active = true;
    void getTaxonomyManager(TaxonomyRootName.FORVALTNINGSBERATTELSE).then((m) => {
      if (active) setTaxonomyManager(m);
    });
    return () => {
      active = false;
    };
  }, []);

  const availableTaxonomyItems = taxonomyManager
    ? taxonomyManager.getRoot()
    : null;

  const editor = usePrepopulateSection({
    taxonomyManager,
    availableTaxonomyItems,
    sectionName: "forvaltningsberattelse",
    maxNumPreviousYears: 0,
  });

  const groups = useMemo<TaxonomyItem[]>(
    () => availableTaxonomyItems?.children[0].children ?? [],
    [availableTaxonomyItems],
  );

  const flerarsoversiktItem = useMemo(
    () =>
      availableTaxonomyItems?.childrenFlat.find(
        (item) => item.xmlName === FLERARSOVERSIKT,
      ),
    [availableTaxonomyItems],
  );

  if (!arsredovisning || !editor || groups.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-surface p-6 text-sm text-ink-light shadow-card">
        Laddar förvaltningsberättelse…
      </div>
    );
  }

  const grouped = groupPool(editor.pool, groups);
  const scrollspyGroups: ScrollspyGroup[] = groups.map((g) => ({
    id: `forvaltningsberattelse-${g.xmlName}`,
    title: g.additionalData.displayLabel ?? g.xmlName,
  }));

  return (
    <BeloppradEditContext.Provider
      value={{
        taxonomyManager: editor.taxonomyManager,
        editField: editor.editField,
      }}
    >
      <ScrollspySection groups={scrollspyGroups}>
        {groups.map((group, groupIndex) => (
          <EditGroup
            key={group.xmlName}
            id={`forvaltningsberattelse-${group.xmlName}`}
            title={group.additionalData.displayLabel ?? group.xmlName}
          >
            {group.xmlName === FLERARSOVERSIKT && flerarsoversiktItem ? (
              <EditForvaltningsberattelseFlerarsoversikt
                arsredovisning={arsredovisning}
                taxonomyManager={editor.taxonomyManager}
                groupTaxonomyItem={flerarsoversiktItem}
              />
            ) : group.xmlName === FORANDRING_EGET_KAPITAL ? (
              <p className="text-sm text-ink-light">
                Tabellen för förändring i eget kapital porteras härnäst (egen
                rutnätseditor).
              </p>
            ) : (
              <div className="edit-belopprad-table">
                <table>
                  <tbody>
                    {grouped[groupIndex].map((belopprad) => (
                      <EditBelopprad
                        key={`${belopprad.taxonomyItemName}-${belopprad.labelType ?? ""}`}
                        belopprad={belopprad}
                        comparableNumPreviousYears={0}
                        stringMinimumLevel={1}
                        stringMultiline
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </EditGroup>
        ))}
      </ScrollspySection>
    </BeloppradEditContext.Provider>
  );
}
