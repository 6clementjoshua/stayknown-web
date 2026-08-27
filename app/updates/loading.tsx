export default function UpdatesLoading() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="fixed inset-x-0 top-0 z-[200] h-1.5 overflow-hidden bg-white/[0.12]">
        <div className="h-full w-1/3 animate-[skUpdatesRouteLoad_1s_ease-in-out_infinite] bg-white" />
      </div>

      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/50">
          <span className="h-4 w-4 animate-spin rounded-full border border-white/25 border-t-white" />
          Loading StayKnown Update…
        </div>
      </div>

      <style>{`
        @keyframes skUpdatesRouteLoad {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(420%); }
        }
      `}</style>
    </main>
  );
}
