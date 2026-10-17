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
      <main style={{ paddingTop: "72px" /* hauteur du header fixe */ }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
