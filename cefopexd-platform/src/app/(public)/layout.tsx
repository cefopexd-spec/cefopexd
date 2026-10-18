import Header from "@/components/Header";
import Footer from "@/components/Footer";

/* =============================================
   LAYOUT PAGES PUBLIQUES
   ============================================= */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main style={{ paddingTop: "var(--header-h)" /* hauteur du header fixe (2 étages) */ }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
