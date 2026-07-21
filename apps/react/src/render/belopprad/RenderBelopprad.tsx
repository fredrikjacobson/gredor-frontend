import { isBeloppradMonetary } from "@/model/arsredovisning/beloppradtyper/BeloppradMonetary.ts";
import { isBeloppradString } from "@/model/arsredovisning/beloppradtyper/BeloppradString.ts";
import { isBeloppradEnum } from "@/model/arsredovisning/beloppradtyper/BeloppradEnum.ts";
import { isBeloppradComparable } from "@/model/arsredovisning/beloppradtyper/BaseBeloppradComparable.ts";
import {
  type Belopprad,
  getTaxonomyItemForBelopprad,
} from "@/model/arsredovisning/Belopprad.ts";
import type { TaxonomyManager } from "@/util/TaxonomyManager.ts";
import { BeloppFormat } from "@/model/arsredovisning/BeloppFormat.ts";
import { getContextRefPrefix } from "@/util/renderUtils.ts";
import type { Redovisningsvaluta } from "@/model/arsredovisning/Redovisningsinformation.ts";
import { RenderBeloppradDisplayAsType } from "@/render/belopprad/RenderBeloppradDisplayAsType.ts";
import { RenderBeloppradMonetary } from "@/render/belopprad/RenderBeloppradMonetary.tsx";
import { RenderBeloppradString } from "@/render/belopprad/RenderBeloppradString.tsx";
import { RenderBeloppradEnum } from "@/render/belopprad/RenderBeloppradEnum.tsx";
import { RenderBeloppradOtherComparable } from "@/render/belopprad/RenderBeloppradOtherComparable.tsx";

/**
 * Wrapper som väljer rätt belopprads-komponent efter typ — port av
 * RenderBelopprad.vue. Sträng + monetär är porterade (räcker för
 * resultaträkningen); enum/tuple/övrig-jämförbar tillkommer med sina sektioner.
 */
export function RenderBelopprad(props: {
  taxonomyManager: TaxonomyManager;
  belopprad: Belopprad;
  redovisningsvaluta: Redovisningsvaluta;
  additionalIxbrlAttrs?: Record<string, string>;
  displayAsLevel?: number;
  displayFormat?: BeloppFormat;
  displayHeader?: string;
  comparableDisplayAsType?: RenderBeloppradDisplayAsType;
  comparableNumPreviousYears?: number;
  comparableAllowNot?: boolean;
  monetaryShowBalanceSign?: boolean;
  stringShowHeader?: boolean;
  stringShowHeaderAsAbstract?: boolean;
  stringRaw?: boolean;
}) {
  const { taxonomyManager, belopprad } = props;
  const additionalIxbrlAttrs = props.additionalIxbrlAttrs ?? {};
  const contextRefPrefix = getContextRefPrefix(
    getTaxonomyItemForBelopprad(taxonomyManager, belopprad),
  );

  if (isBeloppradString(belopprad)) {
    return (
      <RenderBeloppradString
        taxonomyManager={taxonomyManager}
        belopprad={belopprad}
        additionalIxbrlAttrs={additionalIxbrlAttrs}
        contextRefPrefix={contextRefPrefix}
        displayAsLevel={props.displayAsLevel}
        displayHeader={props.displayHeader}
        raw={props.stringRaw ?? false}
        showHeader={props.stringShowHeader ?? false}
        showHeaderAsAbstract={props.stringShowHeaderAsAbstract ?? false}
      />
    );
  }

  if (isBeloppradMonetary(belopprad)) {
    return (
      <RenderBeloppradMonetary
        taxonomyManager={taxonomyManager}
        belopprad={belopprad}
        additionalIxbrlAttrs={additionalIxbrlAttrs}
        allowNot={props.comparableAllowNot ?? false}
        contextRefPrefix={contextRefPrefix}
        displayAsLevel={props.displayAsLevel}
        displayAsType={
          props.comparableDisplayAsType ?? RenderBeloppradDisplayAsType.AUTO
        }
        displayFormat={props.displayFormat ?? BeloppFormat.HELTAL}
        displayHeader={props.displayHeader}
        redovisningsvaluta={props.redovisningsvaluta}
        showBalanceSign={props.monetaryShowBalanceSign ?? false}
      />
    );
  }

  const comparableProps = {
    taxonomyManager,
    additionalIxbrlAttrs,
    allowNot: props.comparableAllowNot ?? false,
    contextRefPrefix,
    displayAsLevel: props.displayAsLevel,
    displayAsType:
      props.comparableDisplayAsType ?? RenderBeloppradDisplayAsType.AUTO,
    displayFormat: props.displayFormat ?? BeloppFormat.HELTAL,
    displayHeader: props.displayHeader,
  };

  if (isBeloppradEnum(belopprad)) {
    return <RenderBeloppradEnum {...comparableProps} belopprad={belopprad} />;
  }

  if (isBeloppradComparable(belopprad)) {
    return (
      <RenderBeloppradOtherComparable {...comparableProps} belopprad={belopprad} />
    );
  }

  // TODO(fas 3): tuple-belopprader porteras härnäst (flerårsöversikt,
  // förändring eget kapital, vissa noter). Tills dess renderas de inte.
  if (import.meta.env.DEV) {
    console.warn(
      `RenderBelopprad: typ ${belopprad.type} (${belopprad.taxonomyItemName}) inte porterad än`,
    );
  }
  return null;
}
