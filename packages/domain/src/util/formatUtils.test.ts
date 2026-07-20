import { describe, expect, it } from "vitest";
import {
  formatDateForFlerarsoversikt,
  formatNumber,
  tryFormatOrgnr,
} from "@/util/formatUtils.ts";
import { BeloppFormat } from "@/model/arsredovisning/BeloppFormat.ts";

describe("formatNumber (utan taxonomiobjekt = ren formatering)", () => {
  it("lägger till mellanslag som tusentalsseparator (HELTAL)", () => {
    expect(formatNumber("1234567", null, BeloppFormat.HELTAL)).toBe(
      "1 234 567",
    );
  });

  it("dividerar med 1000 och avrundar (TUSENTAL)", () => {
    expect(formatNumber("2500000", null, BeloppFormat.TUSENTAL)).toBe("2 500");
  });

  it("tar bort tecknet när removeSign är satt", () => {
    expect(
      formatNumber("-1234567", null, BeloppFormat.HELTAL, { removeSign: true }),
    ).toBe("1 234 567");
  });

  it("behåller minustecknet utan removeSign", () => {
    expect(formatNumber("-1000", null, BeloppFormat.HELTAL)).toBe("-1 000");
  });
});

describe("formatDateForFlerarsoversikt", () => {
  it("returnerar endast året för sista dagen på året", () => {
    expect(formatDateForFlerarsoversikt("2024-12-31")).toBe("2024");
  });

  it("returnerar år-månad för andra datum", () => {
    expect(formatDateForFlerarsoversikt("2024-06-30")).toBe("2024-06");
  });

  it("returnerar tom sträng för ogiltigt datum", () => {
    expect(formatDateForFlerarsoversikt("")).toBe("");
  });
});

describe("tryFormatOrgnr", () => {
  it("lägger till bindestreck för tio siffror", () => {
    expect(tryFormatOrgnr("5560360793")).toBe("556036-0793");
  });

  it("lämnar redan formaterade/ogiltiga värden orörda", () => {
    expect(tryFormatOrgnr("556036-0793")).toBe("556036-0793");
    expect(tryFormatOrgnr("55603")).toBe("55603");
  });
});
