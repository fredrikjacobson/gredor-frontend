import { type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, Mail, ShieldCheck, TriangleAlert } from "lucide-react";

export const Route = createFileRoute("/om-gredor")({
  component: OmGredorPage,
});

function InfoCard(props: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card p-6 shadow-card">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          {props.icon}
        </div>
        <h2 className="text-lg font-semibold text-ink">{props.title}</h2>
      </div>
      <div className="space-y-3 text-sm leading-relaxed text-ink-medium">
        {props.children}
      </div>
    </section>
  );
}

function OmGredorPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Leaf className="size-7" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">
          Om Gredor
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-ink-medium">
          Ett kostnadsfritt, öppet verktyg för att ta fram och lämna in
          K2-årsredovisningar för aktiebolag – byggt av småföretagare för
          småföretagare.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <InfoCard icon={<Leaf className="size-5" />} title="Vad är Gredor?">
          <p>
            Gredor är ett kostnadsfritt verktyg som du kan använda för att ta
            fram årsredovisningar och skicka in dem till Bolagsverket. Du kan
            alltså lämna in företagets årsredovisning digitalt helt gratis.
          </p>
          <p>
            Verktyget har stöd för alla delar i en vanlig K2-årsredovisning för
            aktiebolag utan revisor, och du kan dessutom enkelt komma igång
            genom att importera en SIE-fil från ditt bokföringssystem om du
            vill.
          </p>
          <p>
            Gredor är utvecklat av småföretagare för småföretagare. Vår vision
            är att det ska vara enkelt och smidigt att driva ett litet bolag –
            utan att man ska behöva lägga en massa pengar på programvara.
          </p>
        </InfoCard>

        <InfoCard
          icon={<TriangleAlert className="size-5" />}
          title="Viktigt att tänka på"
        >
          <p>
            Målgruppen för Gredor är främst företagare som är bekväma med att
            ställa upp årsredovisningen själva. Har du exempelvis tidigare
            skrivit din årsredovisning i Word och sedan postat den till
            Bolagsverket, kan Gredor vara ett bra alternativ för dig.
          </p>
          <p>
            Vi som arbetar med Gredor har begränsad möjlighet att ge support;
            bland annat kan vi inte svara på frågor om vad din årsredovisning
            borde innehålla. För frågor av sådana slag hänvisar vi till{" "}
            <a
              className="text-primary hover:underline"
              href="https://bolagsverket.se/foretag/aktiebolag/arsredovisningforaktiebolag.759.html#h-Innehallienarsredovisning"
            >
              Bolagsverkets exempel
            </a>{" "}
            och{" "}
            <a
              className="text-primary hover:underline"
              href="https://www.bfn.se/informationsmaterial/vagledningar/#arsredovisningk2"
            >
              Bokföringsnämndens vägledning
            </a>
            , alternativt en redovisningskonsult.{" "}
            <strong className="text-ink">
              Gredor tillhandahålls utan några garantier.
            </strong>
          </p>
          <p>
            Gredor stöder endast regelverket för årsredovisning i mindre företag
            (K2), för aktiebolag utan revisor.
          </p>
        </InfoCard>

        <InfoCard
          icon={<ShieldCheck className="size-5" />}
          title="Integritetspolicy"
        >
          <p>
            Gredor har inget intresse av att kartlägga ditt liv; Gredor skickar
            aldrig någon personlig data via internet utöver det som är
            nödvändigt för att tjänsten ska fungera.
          </p>
          <p>
            <Link
              to="/integritetspolicy"
              className="font-medium text-primary hover:underline"
            >
              Läs hela integritetspolicyn →
            </Link>
          </p>
        </InfoCard>

        <InfoCard icon={<Mail className="size-5" />} title="Kontakt">
          <p>
            <strong className="text-ink">
              OBS: Vi är inte redovisningskonsulter och kan inte svara på frågor
              om t.ex. vad din årsredovisning borde innehålla.
            </strong>
          </p>
          <p>
            E-post:{" "}
            <a
              className="text-primary hover:underline"
              href="mailto:gredor@potatiz.com"
            >
              gredor@potatiz.com
            </a>
          </p>
          <p>
            GitHub:{" "}
            <a
              className="text-primary hover:underline"
              href="https://github.com/GredorTools"
              target="_blank"
              rel="noreferrer"
            >
              GredorTools
            </a>{" "}
            (open-source!)
          </p>
          <p>
            Gredor tillhandahålls av Potatron Tech AB (559256-0287, Stockholm).
          </p>
        </InfoCard>
      </div>
    </div>
  );
}
