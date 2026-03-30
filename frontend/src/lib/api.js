const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? "http://127.0.0.1:8000" : "");

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Request failed");
  }

  return response.json();
}

export function analyzeJob(payload) {
  return request("/analyze-job", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function predictSalary(payload) {
  return request("/predict-salary", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function addOffer(payload) {
  return request("/add-offer", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function compareOffers() {
  return request("/compare-offers");
}

export function negotiate(payload) {
  return request("/negotiate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
