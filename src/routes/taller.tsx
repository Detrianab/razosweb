import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

const searchSchema = z.object({
  coleccion: z.string().optional(),
  diseno: z.string().optional(),
  color: z.string().optional(),
});

/** Ruta antigua: ahora el personalizador vive en /personalizar. */
export const Route = createFileRoute("/taller")({
  validateSearch: searchSchema,
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/personalizar", search });
  },
});
