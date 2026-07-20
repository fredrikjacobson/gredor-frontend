import { useQuery } from "@tanstack/react-query";
import { client } from "@/api/client.ts";

/**
 * Hämtar företagsinformation för ett organisationsnummer — motsvarar
 * useCompanyRecordsApi, men som en query som aktiveras när ett giltigt
 * (tio siffror) orgnr matats in.
 */
export function useCompanyRecord(organisationsnummer: string) {
  const orgnr = organisationsnummer.replace("-", "");
  const enabled = /^\d{10}$/.test(orgnr);

  return useQuery({
    queryKey: ["company-record", orgnr],
    enabled,
    queryFn: async () => {
      const { data, error, response } = await client.GET(
        "/v1/information/records/{orgnr}",
        { params: { path: { orgnr } } },
      );
      if (error) {
        throw Object.assign(new Error(String(error)), {
          status: (response as Response).status,
        });
      }
      return data;
    },
  });
}
