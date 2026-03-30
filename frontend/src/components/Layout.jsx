import { Link, NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Job Decoder" },
  { to: "/salary", label: "Salary Estimator" },
  { to: "/offers", label: "Offer Dashboard" },
];

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-grid bg-[size:42px_42px] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <header className="mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-glow backdrop-blur">
          <div className="flex flex-col gap-6 px-6 py-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Link to="/" className="text-sm uppercase tracking-[0.35em] text-sky-300">
                OfferWise
              </Link>
              <h1 className="mt-3 font-display text-4xl text-white sm:text-5xl">
                Decode offers with sharper salary signals and negotiation guidance.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Paste a job description, estimate market pay, compare offers side by side, and draft a smarter negotiation message.
              </p>
            </div>
            <nav className="flex flex-wrap gap-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-full border px-4 py-2 text-sm transition ${
                      isActive
                        ? "border-sky-300 bg-sky-400/20 text-white"
                        : "border-white/10 bg-black/20 text-slate-300 hover:border-sky-300/40 hover:text-white"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

