export default function ResultCard({ title, children, accent = "sky" }) {
  const accentClass = {
    sky: "from-sky-400/20 to-cyan-300/5 border-sky-300/20",
    amber: "from-amber-400/20 to-orange-300/5 border-amber-300/20",
    emerald: "from-emerald-400/20 to-green-300/5 border-emerald-300/20",
    rose: "from-rose-400/20 to-pink-300/5 border-rose-300/20",
  }[accent];

  return (
    <section className={`rounded-[1.75rem] border bg-gradient-to-br ${accentClass} p-5 backdrop-blur`}>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-4 text-sm text-slate-200">{children}</div>
    </section>
  );
}

