export default function HomePage() {
  return (
    <main className="min-h-screen p-8 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">Tomorrow&apos;s Winner</h1>
      <p className="text-gray-600 mt-2">MVP scaffold is up. Check /api/health for status.</p>
      <a className="text-blue-600 underline mt-4" href="/api/health">Healthcheck</a>
    </main>
  );
}
