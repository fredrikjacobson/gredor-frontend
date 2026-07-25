import { NewArsredovisningDialog } from "@/components/NewArsredovisningDialog.tsx";
import type { StartPageChromeProps } from "@/landing/useStartPage.ts";

/**
 * Den dolda filinputen och importguiden, renderade av rutten som SYSKON till
 * layoutvarianten. Får aldrig lazy-laddas: startpage.spec.ts anropar
 * setInputFiles direkt efter goto("/") utan att vänta, så inputen måste finnas
 * i första målningen.
 */
export function StartPageChrome(props: StartPageChromeProps) {
  return (
    <>
      <input
        ref={props.fileInputRef}
        type="file"
        accept=".gredorutkast,.gredorfardig"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) props.onFileSelected(file);
          e.target.value = "";
        }}
      />

      <NewArsredovisningDialog
        open={props.newDialogOpen}
        onOpenChange={props.onNewDialogOpenChange}
        onCreated={props.onCreated}
      />
    </>
  );
}
