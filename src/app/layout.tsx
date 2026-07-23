import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteChrome } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "SkyTrack — Ne perdez plus jamais ce qui compte",
  description:
    "La carte de tracking SkyTrack se glisse dans votre portefeuille et le retrouve depuis votre téléphone Android ou iPhone, via les réseaux Google Find Hub et Localiser. Livraison au Cameroun, paiement MoMo, Orange Money ou Visa.",
};

export const viewport: Viewport = {
  themeColor: "#F4F8FC",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
