import { queryOptions } from "@tanstack/react-query";
import { getPrivacyInfo, getPublicContact } from "./public.functions";

export const privacyQuery = queryOptions({
  queryKey: ["public", "privacy"],
  queryFn: () => getPrivacyInfo(),
  staleTime: 60_000,
});

export const contactQuery = queryOptions({
  queryKey: ["public", "contact"],
  queryFn: () => getPublicContact(),
  staleTime: 60_000,
});
