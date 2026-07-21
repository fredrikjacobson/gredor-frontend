import { type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import type { Belopprad } from "@/model/arsredovisning/Belopprad.ts";
import { getTaxonomyItemForBelopprad } from "@/model/arsredovisning/Belopprad.ts";
import type { BaseBeloppradComparable } from "@/model/arsredovisning/beloppradtyper/BaseBeloppradComparable.ts";
import type { TaxonomyItem } from "@/model/taxonomy/TaxonomyItem.ts";
import { getTestIdForBelopprad } from "@/util/inputUtils.ts";
import { cn } from "@/lib/utils.ts";
import { useBeloppradEdit } from "@/edit/belopprad/BeloppradEditContext.ts";
import { EditBeloppradTitle } from "@/edit/belopprad/EditBeloppradTitle.tsx";

/**
 * Port av BaseEditBeloppradContainer.vue + BaseEditBeloppradComparable.vue.
 * Radbehållare (`<tr>`) + celler: rubrik, not, innevarande år, tidigare år,
 * radera. Slots (`renderCurrentYear`/`renderPreviousYear`) låter enum-subtypen
 * byta ut text-inputen mot en `<select>`.
 */
export function EditBeloppradComparableRow({
  belopprad,
  displayAsLevel,
  numPreviousYears,
  allowNot,
  allowDelete,
  isSummarad,
  showBalanceSign,
  allowedValueRegex,
  onDelete,
  renderCurrentYear,
  renderPreviousYear,
}: {
  belopprad: BaseBeloppradComparable;
  displayAsLevel?: number;
  numPreviousYears: number;
  allowNot?: boolean;
  allowDelete?: boolean;
  isSummarad?: boolean;
  showBalanceSign?: boolean;
  allowedValueRegex?: RegExp;
  onDelete?: () => void;
  renderCurrentYear?: (taxonomyItem: TaxonomyItem) => ReactNode;
  renderPreviousYear?: (taxonomyItem: TaxonomyItem, index: number) => ReactNode;
}) {
  const { taxonomyManager, editField } = useBeloppradEdit();
  const taxonomyItem = getTaxonomyItemForBelopprad(taxonomyManager, belopprad);
  const displayLevel = displayAsLevel ?? taxonomyItem.level;
  const isAbstract = taxonomyItem.properties.abstract === "true";

  const balance = taxonomyItem.properties.balance;
  const isInstant = taxonomyItem.properties.periodType === "instant";
  const showMinus = showBalanceSign && balance && (balance === "debit") !== isInstant;
  const showPlus = showBalanceSign && balance && (balance === "credit") !== isInstant;

  const setValue =
    (write: (b: BaseBeloppradComparable, v: string) => void) =>
    (next: string, current: string) => {
      // Tillåt alltid radering; tillåt insättning bara om mönstret matchar.
      if (
        next.length <= current.length ||
        !allowedValueRegex ||
        allowedValueRegex.test(next.trim())
      ) {
        editField(belopprad, (b) => write(b as BaseBeloppradComparable, next));
      }
    };

  const setCurrent = setValue((b, v) => (b.beloppNuvarandeAr = v));

  const BalanceSign = () =>
    showMinus ? <span>−</span> : showPlus ? <span>+</span> : null;

  return (
    <tr
      className={cn(
        "belopprad-row",
        isAbstract && "is-abstract",
        `is-level-${displayLevel}`,
      )}
    >
      <td className="belopprad-title-cell">
        <EditBeloppradTitle belopprad={belopprad} displayAsLevel={displayAsLevel} />
      </td>

      {allowNot && (
        <td className="not-container">
          {!isAbstract && (
            <input
              type="text"
              maxLength={10}
              className="belopprad-input"
              data-testid={`edit-${belopprad.taxonomyItemName}-not`}
              value={belopprad.not ?? ""}
              onChange={(e) =>
                editField(belopprad, (b) => {
                  (b as BaseBeloppradComparable).not = e.target.value;
                })
              }
              onBlur={(e) =>
                editField(belopprad, (b) => {
                  (b as BaseBeloppradComparable).not = e.target.value.trim();
                })
              }
            />
          )}
        </td>
      )}

      <td className="value-container">
        <div className="flex items-center justify-end gap-1">
          {renderCurrentYear ? (
            renderCurrentYear(taxonomyItem)
          ) : (
            <>
              <BalanceSign />
              {!isAbstract && (
                <input
                  type="text"
                  className="belopprad-input text-right"
                  disabled={isSummarad}
                  data-testid={getTestIdForBelopprad(belopprad, "current-year")}
                  value={belopprad.beloppNuvarandeAr}
                  onChange={(e) =>
                    setCurrent(e.target.value, belopprad.beloppNuvarandeAr)
                  }
                />
              )}
            </>
          )}
        </div>
      </td>

      {Array.from({ length: numPreviousYears }, (_, i) => (
        <td key={i} className="value-container">
          <div className="flex items-center justify-end gap-1">
            {renderPreviousYear ? (
              renderPreviousYear(taxonomyItem, i)
            ) : (
              <>
                <BalanceSign />
                {!isAbstract && (
                  <input
                    type="text"
                    className="belopprad-input text-right"
                    disabled={isSummarad}
                    data-testid={getTestIdForBelopprad(
                      belopprad,
                      `previous-year-${i + 1}`,
                    )}
                    value={belopprad.beloppTidigareAr[i] ?? ""}
                    onChange={(e) =>
                      setValue(
                        (b, v) => (b.beloppTidigareAr[i] = v),
                      )(e.target.value, belopprad.beloppTidigareAr[i] ?? "")
                    }
                  />
                )}
              </>
            )}
          </div>
        </td>
      ))}

      {allowDelete && (
        <td>
          <button
            type="button"
            title="Ta bort beloppraden"
            onClick={onDelete}
            className="text-danger hover:opacity-80"
          >
            <Trash2 className="size-4" />
          </button>
        </td>
      )}
    </tr>
  );
}
