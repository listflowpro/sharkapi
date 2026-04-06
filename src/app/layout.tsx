// Root layout — locale-specific layout is in app/[locale]/layout.tsx
// This minimal root layout is required by Next.js App Router.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
