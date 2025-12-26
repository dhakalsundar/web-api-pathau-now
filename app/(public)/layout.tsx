import Header from "./_components/Header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <div className="container">{children}</div>
    </div>
  );
}
