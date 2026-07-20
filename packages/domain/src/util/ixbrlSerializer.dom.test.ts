// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { convertHTMLToiXBRL } from "@/util/ixbrlSerializer.ts";

/**
 * Låser transformkärnans beteende (ramverksoberoende delen): tag-/attribut-
 * versalisering, xmlns-injektion, borttagning av @delete-whitespace. CSS-
 * insamlingen skjuts in som tom, så testet kräver ingen webbläsar-CSS.
 */
async function serialize(innerHtml: string): Promise<string> {
  const root = document.createElement("div");
  root.innerHTML = innerHtml;
  return convertHTMLToiXBRL(root, {
    title: "Test",
    programVersion: "test-1",
    collectUsedCss: async () => "",
  });
}

describe("convertHTMLToiXBRL (delad transformkärna)", () => {
  it("återställer versalisering på ix:nonFraction-attribut (contextref → contextRef)", async () => {
    const out = await serialize(
      '<ix:nonfraction contextref="period0" unitref="sek" name="se-gen-base:X" decimals="0">1</ix:nonfraction>',
    );
    expect(out).toContain('contextRef="period0"');
    expect(out).toContain('unitRef="sek"');
    expect(out).not.toContain("contextref=");
  });

  it("injicerar xmlns-deklarationerna på <html>", async () => {
    const out = await serialize("<p>hej</p>");
    expect(out).toContain(
      'xmlns:ix="http://www.xbrl.org/2013/inlineXBRL"',
    );
    expect(out).toContain(
      'xmlns:xbrli="http://www.xbrl.org/2003/instance"',
    );
  });

  it("tar bort <!-- @delete-whitespace --> och skriver programversion", async () => {
    const out = await serialize(
      "<span>a</span><!-- @delete-whitespace --><span>b</span>",
    );
    expect(out).not.toContain("@delete-whitespace");
    expect(out).toContain('content="test-1"');
  });
});
