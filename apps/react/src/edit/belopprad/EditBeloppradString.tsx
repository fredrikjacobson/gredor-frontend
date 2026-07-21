import { Trash2 } from "lucide-react";
import type { BeloppradString } from "@/model/arsredovisning/beloppradtyper/BeloppradString.ts";
import { getTaxonomyItemForBelopprad } from "@/model/arsredovisning/Belopprad.ts";
import { getTestIdForBelopprad } from "@/util/inputUtils.ts";
import { cn } from "@/lib/utils.ts";
import { useBeloppradEdit } from "@/edit/belopprad/BeloppradEditContext.ts";
import { EditBeloppradTitle } from "@/edit/belopprad/EditBeloppradTitle.tsx";

/** Port av EditBeloppradString.vue — sträng-belopprad (rubrik + text/textarea). */
export function EditBeloppradString({
  belopprad,
  displayAsLevel,
  multiline,
  allowDelete,
  comparableNumPreviousYears,
  onDelete,
}: {
  belopprad: BeloppradString;
  displayAsLevel?: number;
  multiline?: boolean;
  allowDelete?: boolean;
  comparableNumPreviousYears: number;
  onDelete?: () => void;
}) {
  const { taxonomyManager, editField } = useBeloppradEdit();
  const taxonomyItem = getTaxonomyItemForBelopprad(taxonomyManager, belopprad);
  const isAbstract = taxonomyItem.properties.abstract === "true";
  const displayLevel = displayAsLevel ?? taxonomyItem.level;
  const rowClass = cn("belopprad-row", isAbstract && "is-abstract", `is-level-${displayLevel}`);

  const setText = (value: string) =>
    editField(belopprad, (b) => {
      (b as BeloppradString).text = value;
    });

  if (multiline && !isAbstract) {
    return (
      <>
        <tr className={rowClass}>
          <td colSpan={comparableNumPreviousYears + 2} className="belopprad-title-cell">
            <EditBeloppradTitle belopprad={belopprad} displayAsLevel={displayAsLevel} />
          </td>
          {allowDelete && (
            <td>
              <button type="button" className="text-danger" onClick={onDelete}>
                <Trash2 className="size-4" />
              </button>
            </td>
          )}
        </tr>
        <tr className={rowClass}>
          <td colSpan={comparableNumPreviousYears + 3}>
            <textarea
              className="belopprad-input min-h-24 w-full"
              data-testid={getTestIdForBelopprad(belopprad)}
              value={belopprad.text ?? ""}
              onChange={(e) => setText(e.target.value)}
            />
          </td>
        </tr>
      </>
    );
  }

  return (
    <tr className={rowClass}>
      <td className="belopprad-title-cell">
        <EditBeloppradTitle belopprad={belopprad} displayAsLevel={displayAsLevel} />
      </td>
      {!isAbstract && (
        <td colSpan={comparableNumPreviousYears + 1} className="value-container text-left">
          <input
            type="text"
            className="belopprad-input w-full"
            data-testid={`edit-${belopprad.taxonomyItemName}`}
            value={belopprad.text ?? ""}
            onChange={(e) => setText(e.target.value)}
          />
        </td>
      )}
      {allowDelete && !isAbstract && (
        <td>
          <button type="button" className="text-danger" onClick={onDelete}>
            <Trash2 className="size-4" />
          </button>
        </td>
      )}
    </tr>
  );
}
