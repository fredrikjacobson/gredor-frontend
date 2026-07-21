import type { Belopprad } from "@/model/arsredovisning/Belopprad.ts";
import { getTaxonomyItemForBelopprad } from "@/model/arsredovisning/Belopprad.ts";
import { isBeloppradString } from "@/model/arsredovisning/beloppradtyper/BeloppradString.ts";
import { isBeloppradMonetary } from "@/model/arsredovisning/beloppradtyper/BeloppradMonetary.ts";
import { isBeloppradEnum } from "@/model/arsredovisning/beloppradtyper/BeloppradEnum.ts";
import { isBeloppradComparable } from "@/model/arsredovisning/beloppradtyper/BaseBeloppradComparable.ts";
import { isBeloppradTuple } from "@/model/arsredovisning/beloppradtyper/BeloppradTuple.ts";
import type { BaseBeloppradComparable } from "@/model/arsredovisning/beloppradtyper/BaseBeloppradComparable.ts";
import { isTaxonomyItemForRealNumber } from "@/model/taxonomy/TaxonomyItem.ts";
import { formatEnumValueDisplayLabel } from "@/util/formatUtils.ts";
import { useBeloppradEdit } from "@/edit/belopprad/BeloppradEditContext.ts";
import { EditBeloppradComparableRow } from "@/edit/belopprad/EditBeloppradComparableRow.tsx";
import { EditBeloppradString } from "@/edit/belopprad/EditBeloppradString.tsx";
import { EditBeloppradTuple } from "@/edit/belopprad/EditBeloppradTuple.tsx";

export interface EditBeloppradProps {
  belopprad: Belopprad;
  allowDelete?: boolean;
  valueColspanOverride?: number;
  displayAsLevel?: number;
  comparableNumPreviousYears?: number;
  comparableAllowNot?: boolean;
  monetaryShowBalanceSign?: boolean;
  stringMultiline?: boolean;
  stringMinimumLevel?: number;
  /** Dölj radrubriken (används när en not med ett enda fält redan namnges av
   *  sin grupp-/kategorirubrik, så etiketten inte upprepas). */
  hideTitle?: boolean;
  onDelete?: () => void;
}

/**
 * Port av EditBelopprad.vue — väljer subtyps-komponent via typvakter (samma
 * ordning som Vue: string → monetary → enum → comparable → tuple). En yttre
 * grind döljer höga abstrakta sträng-rubriker (stringMinimumLevel).
 */
export function EditBelopprad(props: EditBeloppradProps) {
  const { taxonomyManager, editField } = useBeloppradEdit();
  const { belopprad } = props;
  const taxonomyItem = getTaxonomyItemForBelopprad(taxonomyManager, belopprad);
  const numPreviousYears = props.comparableNumPreviousYears ?? 0;

  // Yttre grind (som Vue): rendera inte höga abstrakta sträng-rubriker.
  const passesGate =
    taxonomyItem.properties.type !== "xbrli:stringItemType" ||
    taxonomyItem.childrenFlat.length < 1 ||
    taxonomyItem.level > (props.stringMinimumLevel ?? -1);
  if (!passesGate) return null;

  if (isBeloppradString(belopprad)) {
    return (
      <EditBeloppradString
        belopprad={belopprad}
        displayAsLevel={props.displayAsLevel}
        multiline={props.stringMultiline}
        allowDelete={props.allowDelete}
        comparableNumPreviousYears={numPreviousYears}
        hideTitle={props.hideTitle}
        onDelete={props.onDelete}
      />
    );
  }

  if (isBeloppradMonetary(belopprad)) {
    return (
      <EditBeloppradComparableRow
        belopprad={belopprad}
        displayAsLevel={props.displayAsLevel}
        numPreviousYears={numPreviousYears}
        valueColspan={props.valueColspanOverride}
        allowNot={props.comparableAllowNot}
        allowDelete={props.allowDelete}
        isSummarad={taxonomyItem.additionalData.isCalculatedItem}
        showBalanceSign={props.monetaryShowBalanceSign}
        allowedValueRegex={/^-?\d*$/}
        onDelete={props.onDelete}
      />
    );
  }

  if (isBeloppradEnum(belopprad)) {
    const renderSelect = (getValue: () => string, setValue: (v: string) => void) => (
      <select
        className="belopprad-input"
        value={getValue()}
        onChange={(e) => setValue(e.target.value)}
      >
        {taxonomyItem.childrenFlat.map((choice) => (
          <option key={choice.xmlName} value={choice.xmlName}>
            {formatEnumValueDisplayLabel(choice)}
          </option>
        ))}
      </select>
    );
    return (
      <EditBeloppradComparableRow
        belopprad={belopprad}
        displayAsLevel={props.displayAsLevel}
        numPreviousYears={numPreviousYears}
        valueColspan={props.valueColspanOverride}
        allowNot={props.comparableAllowNot}
        allowDelete={props.allowDelete}
        onDelete={props.onDelete}
        renderCurrentYear={() =>
          renderSelect(
            () => belopprad.beloppNuvarandeAr,
            (v) =>
              editField(belopprad, (b) => {
                (b as BaseBeloppradComparable).beloppNuvarandeAr = v;
              }),
          )
        }
        renderPreviousYear={(_ti, i) =>
          renderSelect(
            () => belopprad.beloppTidigareAr[i] ?? "",
            (v) =>
              editField(belopprad, (b) => {
                (b as BaseBeloppradComparable).beloppTidigareAr[i] = v;
              }),
          )
        }
      />
    );
  }

  if (isBeloppradComparable(belopprad)) {
    return (
      <EditBeloppradComparableRow
        belopprad={belopprad}
        displayAsLevel={props.displayAsLevel}
        numPreviousYears={numPreviousYears}
        valueColspan={props.valueColspanOverride}
        allowNot={props.comparableAllowNot}
        allowDelete={props.allowDelete}
        allowedValueRegex={
          isTaxonomyItemForRealNumber(taxonomyItem)
            ? /^-?\d+[.,]?\d*$/
            : undefined
        }
        onDelete={props.onDelete}
      />
    );
  }

  if (isBeloppradTuple(belopprad)) {
    return (
      <EditBeloppradTuple
        belopprad={belopprad}
        comparableNumPreviousYears={numPreviousYears}
      />
    );
  }

  return null;
}
