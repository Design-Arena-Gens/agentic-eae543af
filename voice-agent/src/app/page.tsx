import VoiceAgent from "../components/VoiceAgent";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 pb-16 pt-24 sm:px-8 lg:px-12">
        <header className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground/90">
            EstateVoice
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Voice-first assistant that helps real estate teams capture and confirm property showings.
          </h1>
          <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
            Let prospects book property tours without the back-and-forth. EstateVoice guides the conversation,
            captures key details, checks your availability, and hands you a ready-to-send confirmation package.
          </p>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <VoiceAgent />
          </div>

          <aside className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-2xl font-semibold text-white">Designed for busy agents</h2>
            <ul className="space-y-4 text-sm text-slate-200">
              <li className="rounded-2xl bg-white/5 p-4">
                <p className="font-medium text-white">Voice-native booking</p>
                <p className="mt-2 text-slate-300">Guides prospects through property, budget, timing, and contact details.</p>
              </li>
              <li className="rounded-2xl bg-white/5 p-4">
                <p className="font-medium text-white">Calendar-aware flow</p>
                <p className="mt-2 text-slate-300">Suggests the next available slot and confirms instantly.</p>
              </li>
              <li className="rounded-2xl bg-white/5 p-4">
                <p className="font-medium text-white">Structured CRM-ready output</p>
                <p className="mt-2 text-slate-300">Exports a rich appointment package ready for your CRM.</p>
              </li>
            </ul>
          </aside>
        </section>
      </div>
    </main>
  );
}
