import { Shield, TerminalSquare } from 'lucide-react'
import { useMarketStore } from './store/useMarketStore'

function App() {
  const assets = useMarketStore((state) => state.assets)

  return (
    <main className="min-h-screen bg-black p-6 text-[#00FF41] md:p-10">
      <section className="mx-auto max-w-3xl border border-[#00FF41] p-6 shadow-[0_0_18px_rgba(0,255,65,0.25)]">
        <p className="mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
          <TerminalSquare size={16} />
          root@black-market:~$
          <span className="cursor-block" aria-hidden="true" />
        </p>

        <h1 className="mb-3 text-3xl font-bold">The Black Market</h1>
        <p className="mb-6 text-sm text-[#00d136]">Secure terminal channel established. Browse available digital assets below.</p>

        <div className="space-y-3">
          {assets.map((asset) => (
            <article key={asset.id} className="flex items-center justify-between border border-[#00FF41]/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <Shield size={16} />
                <span>{asset.name}</span>
              </div>
              <span className="font-semibold">{asset.price}</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
