import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "NOVA CUIDAR+ | Apoio e cuidado infantil",
  description: "Plataforma nacional para aproximar famílias e prestadores de serviços de cuidado infantil em Angola."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-AO"><body>{children}</body></html>;
}
