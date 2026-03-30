import { useEffect, useState } from "react";

import ResultCard from "../components/ResultCard";
import { compareOffers } from "../lib/api";

export default function OfferDashboardPage() {
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadOffers() {
    setLoading(true);
    setError("");
    try {
      const response = await compareOffers();
      setOffers(response.offers);
    } catch (loadError) {
      setError("Saved offers could not be loaded. Please check that the backend and database are available.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOffers();
  }, []);

  const totalOffers = offers.length;
  const bestSalary = offers.length ? Math.max(...offers.map((offer) => offer.salary)) : 0;
  const bestGrowth = offers.length ? Math.max(...offers.map((offer) => offer.growth_score)) : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-3">
        <ResultCard title="Offers Saved" accent="sky">
          <p className="text-4xl font-semibold text-white">{totalOffers}</p>
        </ResultCard>
        <ResultCard title="Top Salary" accent="amber">
          <p className="text-4xl font-semibold text-white">{bestSalary ? `$${bestSalary.toLocaleString()}` : "N/A"}</p>
        </ResultCard>
        <ResultCard title="Top Growth Score" accent="emerald">
          <p className="text-4xl font-semibold text-white">{bestGrowth || "N/A"}</p>
        </ResultCard>
      </div>

      <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 backdrop-blur">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl text-white">Offer Comparison Dashboard</h2>
            <p className="mt-2 text-sm text-slate-300">
              Compare compensation, balance, growth signal, and clarity across saved offers.
            </p>
          </div>
          <button
            onClick={loadOffers}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:border-sky-300/50 hover:bg-sky-300/10"
          >
            Refresh
          </button>
        </div>

        {loading ? <p className="text-slate-300">Loading offers...</p> : null}
        {error ? <p className="text-rose-300">{error}</p> : null}

        {!loading && !error && offers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 p-6 text-slate-300">
            Save an offer from the Job Decoder page to start comparing opportunities.
          </div>
        ) : null}

        {!loading && offers.length > 0 ? (
          <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-left">
                <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-400">
                  <tr>
                    <th className="px-4 py-4">Company</th>
                    <th className="px-4 py-4">Role</th>
                    <th className="px-4 py-4">Salary</th>
                    <th className="px-4 py-4">Work-life</th>
                    <th className="px-4 py-4">Growth</th>
                    <th className="px-4 py-4">Clarity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-black/20">
                  {offers.map((offer) => (
                    <tr key={offer.id} className="text-sm text-slate-100">
                      <td className="px-4 py-4 font-semibold">{offer.company}</td>
                      <td className="px-4 py-4">
                        <div>{offer.title}</div>
                      </td>
                      <td className="px-4 py-4">${Number(offer.salary).toLocaleString()}</td>
                      <td className="px-4 py-4 capitalize">
                        <Badge tone={offer.work_life_balance}>{offer.work_life_balance}</Badge>
                      </td>
                      <td className="px-4 py-4">{offer.growth_score}</td>
                      <td className="px-4 py-4">{offer.role_clarity_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function Badge({ tone, children }) {
  const toneClass = {
    high: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
    medium: "border-amber-300/30 bg-amber-300/10 text-amber-100",
    low: "border-rose-300/30 bg-rose-300/10 text-rose-100",
  }[tone];

  return <span className={`rounded-full border px-3 py-1 text-xs ${toneClass}`}>{children}</span>;
}

