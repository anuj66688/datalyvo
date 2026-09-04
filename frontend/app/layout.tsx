import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Datalyvo — From raw data to decisions",
  description: "Upload a dataset and get an instant data profile.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
