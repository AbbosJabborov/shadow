const API_URL = import.meta.env.VITE_API_URL || "https://shadow-ai-sage.vercel.app"

export async function generateReport({ business, region, aiResult }) {
  const response = await fetch(`${API_URL}/api/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ business, region, aiResult }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail || body?.error || `Report request failed (${response.status})`)
  }

  return response.json()
}
