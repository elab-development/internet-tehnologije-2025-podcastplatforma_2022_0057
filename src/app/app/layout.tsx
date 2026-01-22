import PrivateNavbar from "@/components/PrivateNavbar";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PrivateNavbar />
      <main>{children}</main>
    </>
  );
}
