import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/integritetspolicy")({
  component: IntegritetspolicyPage,
});

function IntegritetspolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-ink">Integritetspolicy</h1>
      <div className="space-y-4 text-ink-medium">
        <p>
          Till skillnad från en del andra aktörer har Gredor inget intresse av
          att kartlägga ditt liv; Gredor skickar aldrig någon personlig data via
          internet utöver det som är nödvändigt för att tjänsten ska fungera.
        </p>
        <p>
          De uppgifter som skickas över internet är, utöver sådant som skickas
          automatiskt för att kunna ansluta (t.ex. ip-adress), din
          årsredovisning samt personuppgifter du skriver in. I samband med
          BankID-identifiering lagras ditt personnummer på Gredors servrar i en
          vecka för att förhindra spam, i övrigt sparas inget förutom enkla
          anonymiserade loggar där. Däremot sparar Bolagsverket din
          årsredovisning när du laddar upp den hos dem, annars hade tjänsten
          varit någorlunda värdelös 😉
        </p>
      </div>
    </div>
  );
}
