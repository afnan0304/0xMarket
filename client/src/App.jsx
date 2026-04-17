import { useEffect } from 'react'
import { Shield, TerminalSquare } from 'lucide-react'
import { useMarketStore } from './store/useMarketStore'

function App() {
  const assets = useMarketStore((state) => state.assets)
  const assetsLoading = useMarketStore((state) => state.assetsLoading)
  const assetsError = useMarketStore((state) => state.assetsError)
  const fetchAssets = useMarketStore((state) => state.fetchAssets)
  const health = useMarketStore((state) => state.health)
  const healthLoading = useMarketStore((state) => state.healthLoading)
  const healthError = useMarketStore((state) => state.healthError)
  const fetchHealth = useMarketStore((state) => state.fetchHealth)
  const prompt = useMarketStore((state) => state.prompt)
  const setPrompt = useMarketStore((state) => state.setPrompt)
  const geminiResult = useMarketStore((state) => state.geminiResult)
  const geminiLoading = useMarketStore((state) => state.geminiLoading)
  const geminiError = useMarketStore((state) => state.geminiError)
  const sendGeminiPrompt = useMarketStore((state) => state.sendGeminiPrompt)

  const handleGeminiSubmit = async (event) => {
    event.preventDefault()
    await sendGeminiPrompt()
  }

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

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

        <div className="mb-6 border border-[#00FF41]/60 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm uppercase tracking-wider">System Probe</h2>
            <button
              type="button"
              onClick={fetchHealth}
              disabled={healthLoading}
              className="border border-[#00FF41] px-3 py-1 text-xs font-semibold uppercase tracking-wider transition hover:bg-[#00FF41] hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {healthLoading ? 'Checking...' : 'GET /api/health'}
            </button>
          </div>

          {health && <p className="text-sm">Response: {JSON.stringify(health)}</p>}
          {healthError && <p className="text-sm text-red-400">Error: {healthError}</p>}
          {!health && !healthError && <p className="text-sm text-[#00d136]">No health request sent yet.</p>}
        </div>

        <div className="space-y-3">
          {assetsLoading && <p className="text-sm text-[#00d136]">Loading assets from the data vault...</p>}
          {assetsError && <p className="text-sm text-red-400">Asset error: {assetsError}</p>}
          {!assetsLoading && !assetsError && assets.length === 0 && <p className="text-sm text-[#00d136]">No assets found. Run the seed script to populate inventory.</p>}

          {assets.map((asset) => (
            <article key={asset._id} className="flex items-center justify-between border border-[#00FF41]/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <Shield size={16} />
                <div>
                  <p>{asset.name}</p>
                  <p className="text-xs text-[#00d136]">{asset.category}</p>
                </div>
              </div>
              <span className="font-semibold">{Number(asset.btcPrice).toFixed(2)} BTC</span>
            </article>
          ))}
        </div>

        <form onSubmit={handleGeminiSubmit} className="mt-6 border border-[#00FF41]/60 p-4">
          <h2 className="mb-3 text-sm uppercase tracking-wider">Toolsmith AI Bridge</h2>

          <label htmlFor="gemini-prompt" className="mb-2 block text-xs uppercase tracking-wider text-[#00d136]">
            Prompt
          </label>
          <textarea
            id="gemini-prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Ask for a script, config snippet, or workflow idea..."
            rows={4}
            className="w-full border border-[#00FF41] bg-black p-3 text-sm text-[#00FF41] outline-none placeholder:text-[#00d136]/70 focus:shadow-[0_0_0_1px_rgba(0,255,65,0.35)]"
          />

          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={geminiLoading}
              className="border border-[#00FF41] px-3 py-1 text-xs font-semibold uppercase tracking-wider transition hover:bg-[#00FF41] hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {geminiLoading ? 'Sending...' : 'POST /api/gemini'}
            </button>
          </div>

          {geminiResult && (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#00d136]">Response: {geminiResult}</p>
          )}
          {geminiError && <p className="mt-3 text-sm text-red-400">Error: {geminiError}</p>}
        </form>
      </section>
    </main>
  )
}

export default App
