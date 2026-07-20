import { useQuery } from "@tanstack/react-query";
import { client } from "@/api/client.ts";

/** Hämtar Gredors systemmeddelanden (banner) — motsvarar useMessagesApi. */
export function useMessages() {
  return useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const { data, error } = await client.GET("/v1/message/messages");
      if (error) throw new Error(String(error));
      return data;
    },
  });
}
