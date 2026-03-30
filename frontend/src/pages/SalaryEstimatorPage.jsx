import { useState } from "react";

import ResultCard from "../components/ResultCard";
import { predictSalary } from "../lib/api";

export default function SalaryEstimatorPage() {
  const [form, setForm] = useState({
    title: "ML Engineer",
    location: "Remote",
    experience_level: "mid",
    current_salary: "150000",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await predictSalary({
        ...form,
        current_salary: Number(form.current_salary),
      });
      setResult(response);
    } catch (submitError) {
      setError("OfferWise could not reach the salary model. Please make sure the FastAPI server is running.");
    } finally {
      setLoading(false);
    }
  }

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 backdrop-blur">
        <h2 className="font-display text-3xl text-white">Salary Estimator</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Use job title, location, and experience level to get a model-backed salary range and a quick market positioning read.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="Job title">
            <input value={form.title} onChange={(event) => updateField("title", event.target.value)} className="field" />
          </Field>
          <Field label="Location">
            <input value={form.location} onChange={(event) => updateField("location", event.target.value)} className="field" />
          </Field>
          <Field label="Experience level">
            <select value={form.experience_level} onChange={(event) => updateField("experience_level", event.target.value)} className="field">
              <option value="entry">Entry</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
            </select>
          </Field>
          <Field label="Current or offered salary">
            <input
              type="number"
              value={form.current_salary}
              onChange={(event) => updateField("current_salary", event.target.value)}
              className="field"
            />
          </Field>
          <button className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-200">
            {loading ? "Estimating..." : "Estimate salary"}
          </button>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        </form>
      </section>

      <div className="grid gap-5 sm:grid-cols-2">
        <ResultCard title="Predicted Compensation" accent="amber">
          {result ? (
            <>
              <p className="text-xs uppercase tracking-[0.25em] text-amber-100/80">Model estimate</p>
              <p className="mt-3 text-4xl font-semibold text-white">${result.predicted_salary.toLocaleString()}</p>
            </>
          ) : (
            <p className="text-slate-300">Run the estimator to see the model prediction.</p>
          )}
        </ResultCard>

        <ResultCard title="Range" accent="sky">
          {result ? (
            <p className="text-2xl font-semibold text-white">
              ${result.estimated_min.toLocaleString()} - ${result.estimated_max.toLocaleString()}
            </p>
          ) : (
            <p className="text-slate-300">Your salary band will appear here.</p>
          )}
        </ResultCard>

        <ResultCard title="Market Comparison" accent="emerald">
          {result ? (
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-100/80">Positioning</p>
              <p className="mt-3 text-3xl font-semibold capitalize text-white">{result.market_comparison}</p>
            </div>
          ) : (
            <p className="text-slate-300">OfferWise will compare your input salary to the predicted band.</p>
          )}
        </ResultCard>

        <ResultCard title="How To Read This" accent="rose">
          <p className="leading-6 text-slate-200">
            Underpaid means the entered salary is below the lower end of the estimated market range. Fair means it falls inside the band.
            Competitive means it is above the typical model range.
          </p>
        </ResultCard>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
      {children}
    </label>
  );
}

