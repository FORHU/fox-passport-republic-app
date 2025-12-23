import Navbar from "@/components/shared/Navbar"; // Check your import path

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>
        {children}
      </main>
    </>
  );
}