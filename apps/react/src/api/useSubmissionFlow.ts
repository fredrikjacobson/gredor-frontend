import { base64encode } from "byte-base64";
import { useMutation } from "@tanstack/react-query";
import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import { client } from "@/api/client.ts";

function orgnrOf(arsredovisning: Arsredovisning): string {
  return arsredovisning.foretagsinformation.organisationsnummer.replace("-", "");
}

// personalNumber-cookien skrivs över av webbläsaren; skickas för typ-kraven.
const dummyCookie = { cookie: { personalNumber: "dummy" } } as const;

/**
 * Förbereder validering/inskick och hämtar Bolagsverkets avtalstext —
 * motsvarar usePrepareSubmissionApi.
 */
export function usePrepareSubmission() {
  return useMutation({
    mutationFn: async (arsredovisning: Arsredovisning) => {
      const { data, error } = await client.POST("/v1/submission-flow/prepare", {
        body: { foretagOrgnr: orgnrOf(arsredovisning) },
        params: dummyCookie,
        credentials: "include",
      });
      if (error) throw new Error(String(error));
      return data;
    },
  });
}

/**
 * Validerar årsredovisningen mot Bolagsverket — motsvarar
 * useValidateSubmissionApi, inklusive bortfiltrering av vissa kontroller.
 */
export function useValidateSubmission() {
  return useMutation({
    mutationFn: async (params: {
      arsredovisning: Arsredovisning;
      ixbrl: string;
      discardFaststallelseintygValidations: boolean;
    }) => {
      const { arsredovisning, ixbrl, discardFaststallelseintygValidations } =
        params;
      const { data, error } = await client.POST(
        "/v1/submission-flow/validate",
        {
          body: {
            foretagOrgnr: orgnrOf(arsredovisning),
            ixbrl: base64encode(ixbrl),
          },
          params: dummyCookie,
          credentials: "include",
        },
      );
      if (error) throw new Error(String(error));

      if (data?.utfall) {
        if (discardFaststallelseintygValidations) {
          data.utfall = data.utfall.filter(
            (kontroll) =>
              kontroll.kod == null ||
              !["1103", "1164", "1169", "1179"].includes(kontroll.kod),
          );
        }
        if (arsredovisning.verksamhetsarTidigare.length === 0) {
          // "Jämförelsesiffror saknas i resultaträkningen ..."
          data.utfall = data.utfall.filter((kontroll) => kontroll.kod !== "3007");
        }
      }
      return data;
    },
  });
}

/**
 * Laddar upp årsredovisningen till Bolagsverket — motsvarar
 * useSubmitSubmissionApi.
 */
export function useSubmitSubmission() {
  return useMutation({
    mutationFn: async (params: {
      arsredovisning: Arsredovisning;
      ixbrl: string;
      notificationEmail: string;
    }) => {
      const { arsredovisning, ixbrl, notificationEmail } = params;
      const { data, error } = await client.POST("/v1/submission-flow/submit", {
        body: {
          foretagOrgnr: orgnrOf(arsredovisning),
          ixbrl: base64encode(ixbrl),
          aviseringEpost: notificationEmail,
        },
        params: dummyCookie,
        credentials: "include",
      });
      if (error) throw new Error(String(error));
      return data;
    },
  });
}
