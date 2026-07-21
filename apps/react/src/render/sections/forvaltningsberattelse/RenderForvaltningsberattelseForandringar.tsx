import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import type { TaxonomyManager } from "@/util/TaxonomyManager.ts";
import { getForandringarAsTable } from "@/util/forandringarUtils.ts";
import { isBeloppradInTaxonomyItemList } from "@/model/arsredovisning/Belopprad.ts";
import { isBeloppradMonetary } from "@/model/arsredovisning/beloppradtyper/BeloppradMonetary.ts";
import { BeloppFormat } from "@/model/arsredovisning/BeloppFormat.ts";
import { BaseRenderBeloppradLevel1Header } from "@/render/belopprad/BaseRenderBeloppradLevel1Header.tsx";
import { RenderBeloppradCellComparable } from "@/render/belopprad/RenderBeloppradCellComparable.tsx";

/** Port av RenderForvaltningsberattelseForandringar.vue — förändring eget kapital. */
export function RenderForvaltningsberattelseForandringar(props: {
  arsredovisning: Arsredovisning;
  taxonomyManager: TaxonomyManager;
}) {
  const { arsredovisning, taxonomyManager } = props;

  const groupTaxonomyItem = taxonomyManager.getItemByName(
    "se-gen-base:ForandringEgetKapitalAbstract",
  );

  const belopprader = arsredovisning.forvaltningsberattelse.filter(
    (belopprad) =>
      isBeloppradInTaxonomyItemList(
        groupTaxonomyItem.childrenFlat,
        belopprad,
      ) &&
      // Monetära belopprader utan värde visas inte (kan uppstå vid SIE-import).
      (!isBeloppradMonetary(belopprad) || belopprad.beloppNuvarandeAr),
  );
  if (belopprader.length === 0) return null;

  const forandringarTable = getForandringarAsTable(
    taxonomyManager,
    groupTaxonomyItem,
    belopprader,
  );

  return (
    <table
      className={`forandringar-table num-columns-${forandringarTable.columnNames.length}`}
    >
      <thead>
        <tr>
          <th scope="col">
            <BaseRenderBeloppradLevel1Header taxonomyItem={groupTaxonomyItem} />
          </th>
          {forandringarTable.columnNames.map((columnName) => (
            <th
              key={columnName}
              className="value-container column-name"
              scope="col"
            >
              {columnName}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {forandringarTable.table.map((row, rowIndex) => (
          <tr key={rowIndex}>
            <td>{forandringarTable.rowNames[rowIndex]}</td>
            {row.map((cell, columnIndex) => (
              <td key={columnIndex} className="value-container">
                {cell != null ? (
                  <RenderBeloppradCellComparable
                    additionalIxbrlAttrs={{}}
                    belopprad={cell.belopprad}
                    displayFormat={BeloppFormat.HELTAL}
                    taxonomyItem={cell.taxonomyItem}
                    yearIndex={0}
                  />
                ) : (
                  <>&ndash;</>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
