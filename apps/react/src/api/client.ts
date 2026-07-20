import createClient from "openapi-fetch";
import type { paths } from "@/api/schema/gredor-backend-v1";
import { getConfigValue } from "@/util/configUtils.ts";

/**
 * Delad, typad backend-klient (samma som Vue-appens src/api/client.ts).
 * Auth-, BankID- och submission-anropen skickar credentials: "include" per
 * anrop (cookie-baserad session) — se respektive hook.
 */
export const client = createClient<paths>({
  baseUrl: getConfigValue("VITE_GREDOR_BACKEND_BASEURL"),
});
