import { useState } from "react";

import ResultCard from "../components/ResultCard";
import { addOffer, analyzeJob, negotiate, predictSalary } from "../lib/api";

const initialJobDescription = `We are looking for a product-minded software engineer to build customer-facing features with React, Python, and cloud services. You will collaborate closely with design and data teams, own features from idea to launch, and help improve platform reliability. Responsibilities include shipping high-quality code, mentoring teammates, communicating with stakeholders, and contributing to roadmap planning. Requirements: 4+ years of experience, strong SQL and API design skills, and comfort working in a fast-paced environment. Benefits include hybrid work, learning budget, and career growth opportunities.`;

export default function HomePage() {
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [company, setCompany] = useState("BrightPath");
  const [title, setTitle] = useState("Software Engineer");
  const [location, setLocation] = useState("New York, NY");
  const [experienceLevel, setExperienceLevel] = useState("mid");
  const [salary, setSalary] = useState("145000");
  const [analysis, setAnalysis] = useState(null);
  const [salaryEstimate, setSalaryEstimate] = useState(null);
  const [negotiation, setNegotiation] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: "" });
  const [savedMessage, setSavedMessage] = useState("");

  async function handleAnalyze(event) {
    event.preventDefault();
    setSavedMessage("");
    setStatus({ loading: true, error: "" });

    try {
      const analysisResult = await analyzeJob({ job_description: jobDescription });
      const salaryResult = await predictSalary({
        title,
        location,
        experience_level: experienceLevel,
        current_salary: Number(salary),
      });
      const negotiationResult = await negotiate({
        company,
        title,
        offered_salary: Number(salary),
        estimated_market_salary: salaryResult.predicted_salary,
        role_clarity_score: analysisResult.role_clarity_score,
        work_life_balance: analysisResult.work_life_balance,
      });

      setAnalysis(analysisResult);
      setSalaryEstimate(salaryResult);
      setNegotiation(negotiationResult);
    } catch (error) {
      setStatus({ loading: false, error: "Unable to analyze the role right now. Please check that the backend is running." });
      return;
    }

    setStatus({ loading: false, error: "" });
  }

  async function handleSaveOffer() {
    if (!analysis) {
      setSavedMessage("Run the analysis first so OfferWise can save the decoded offer details.");
      return;
    }

    try {
      await addOffer({
        company,
        title,
        location,
        experience_level: experienceLevel,
        salary: Number(salary),
        job_description: jobDescription,
      });
      setSavedMessage("Offer saved to the comparison dashboard.");
    } catch (error) {
      setSavedMessage("Offer could not be saved. Please confirm the backend is available.");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 backdrop-blur">
        <form className="space-y-5" onSubmit={handleAnalyze}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company">
              <input value={company} onChange={(event) => setCompany(event.target.value)} className="field" />
            </Field>
            <Field label="Job title">
              <input value={title} onChange={(event) => setTitle(event.target.value)} className="field" />
            </Field>
            <Field label="Location">
              <input value={location} onChange={(event) => setLocation(event.target.value)} className="field" />
            </Field>
            <Field label="Experience level">
              <select value={experienceLevel} onChange={(event) => setExperienceLevel(event.target.value)} className="field">
                <option value="entry">Entry</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </select>
            </Field>
          </div>

          <Field label="Offered salary">
            <input value={salary} onChange={(event) => setSalary(event.target.value)} type="number" className="field" />
          </Field>

          <Field label="Job description">
            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              className="field min-h-64 resize-y"
            />
          </Field>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-full bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
            >
              {status.loading ? "Analyzing..." : "Decode this job"}
            </button>
            <button
              type="button"
              onClick={handleSaveOffer}
              className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-emerald-300/50 hover:bg-emerald-300/10"
            >
              Save to compare
            </button>
          </div>

          {status.error ? <p className="text-sm text-rose-300">{status.error}</p> : null}
          {savedMessage ? <p className="text-sm text-emerald-300">{savedMessage}</p> : null}
        </form>
      </section>

      <div className="grid gap-5">
        <ResultCard title="Job Decoder" accent="sky">
          {analysis ? (
            <div className="space-y-4">
              <Metric label="Work-life balance" value={analysis.work_life_balance} />
              <Metric label="Role clarity score" value={`${analysis.role_clarity_score}/100`} />
              <TagGroup title="Key phrases" items={analysis.key_phrases} tone="sky" />
              <ListBlock title="Green flags" items={analysis.green_flags} />
              <ListBlock title="Red flags" items={analysis.red_flags} />
            </div>
          ) : (
            <EmptyState text="Run an analysis to extract skills, clarity, and signal flags from a job description." />
          )}
        </ResultCard>

        <ResultCard title="Salary Snapshot" accent="amber">
          {salaryEstimate ? (
            <div className="space-y-4">
              <Metric label="Predicted market salary" value={`$${salaryEstimate.predicted_salary.toLocaleString()}`} />
              <Metric
                label="Estimated range"
                value={`$${salaryEstimate.estimated_min.toLocaleString()} - $${salaryEstimate.estimated_max.toLocaleString()}`}
              />
              <Metric label="Comparison" value={salaryEstimate.market_comparison} />
            </div>
          ) : (
            <EmptyState text="Market range and comparison appear here after the role is analyzed." />
          )}
        </ResultCard>

        <ResultCard title="Negotiation Assistant" accent="emerald">
          {negotiation ? (
            <div className="space-y-4">
              <Metric
                label="Recommended ask range"
                value={`$${negotiation.recommended_ask_min.toLocaleString()} - $${negotiation.recommended_ask_max.toLocaleString()}`}
              />
              <Metric label="Risk level" value={negotiation.risk_level} />
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.25em] text-emerald-200/80">Suggested message</p>
                <pre className="whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-100">
                  {negotiation.suggested_message}
                </pre>
              </div>
            </div>
          ) : (
            <EmptyState text="OfferWise will generate a negotiation draft after it estimates the market range." />
          )}
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

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function TagGroup({ title, items, tone }) {
  const toneClass = {
    sky: "border-sky-300/20 bg-sky-300/10 text-sky-100",
  }[tone];

  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-[0.25em] text-slate-400">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className={`rounded-full border px-3 py-1 text-xs ${toneClass}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function ListBlock({ title, items }) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-[0.25em] text-slate-400">{title}</p>
      <ul className="space-y-2 pl-5 text-sm text-slate-200">
        {items.map((item) => (
          <li key={item} className="list-disc">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyState({ text }) {
  return <p className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-slate-300">{text}</p>;
}

