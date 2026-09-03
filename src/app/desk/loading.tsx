export default function Loading() {
  // Skeleton shaped like the desk: rail cards + docket rows. Spinner ban.
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-24">
      <div className="pt-10" />
      <div className="h-8 w-40 rounded-sm bg-vessel" />
      <div className="mt-3 h-4 w-72 rounded-sm bg-vessel" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr]">
        <div className="grid content-start gap-6">
          {[64, 120, 180].map((h, i) => (
            <div key={i} className="rounded-card border border-line bg-panel p-5" style={{ minHeight: h }}>
              <div className="h-3 w-16 rounded-sm bg-vessel" />
              <div className="mt-3 h-5 w-3/4 rounded-sm bg-vessel" />
              <div className="mt-2 h-3 w-1/2 rounded-sm bg-vessel" />
            </div>
          ))}
        </div>
        <div className="grid content-start gap-4">
          <div className="h-4 w-28 rounded-sm bg-vessel" />
          {[1, 2].map((i) => (
            <div key={i} className="rounded-card border border-line bg-panel p-5">
              <div className="h-3 w-24 rounded-sm bg-vessel" />
              <div className="mt-3 h-7 w-2/3 rounded-sm bg-vessel" />
              <div className="mt-3 h-3 w-full rounded-sm bg-vessel" />
              <div className="mt-2 h-3 w-4/5 rounded-sm bg-vessel" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
