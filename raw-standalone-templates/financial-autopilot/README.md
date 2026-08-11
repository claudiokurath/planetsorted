# Financial Autopilot

**Category:** Spend Smart
**Slug:** `financial-autopilot`
**Status:** Published
**Launch Date:** 9 August 2026

> Automate your financial future. Personalized strategies, effortless execution, and a clear plan for savings, debt payoff, and retirement — all on autopilot.

A single-page, client-side financial planning calculator. The user enters their income, expenses, savings, debt, and retirement timeline, sets a risk tolerance, and toggles investment automation. The page instantly computes a personalized "autopilot" plan: savings rate, investment allocation, retirement contribution, debt payoff timeline, emergency fund progress, and a step-by-step automated action plan — all visualized with charts.

---

## ✅ Currently Completed Features

- **Hero section** with title, meta badges (launch date, slug, published status), and CTA that scrolls to the planner.
- **Planner form** (`#planner-section`) with the exact fields defined in the source template:
  - Number inputs: `monthly_income`, `monthly_expenses`, `current_savings`, `debt_amount`, `years_to_retirement`
  - Slider: `risk_tolerance` (1–5, default 3)
  - Toggle: `automate_investments` (default on)
- **Calculation engine** (`js/main.js`) implementing the exact provided logic:
  - `savings_rate = MAX(0, (monthly_income - monthly_expenses) / monthly_income)`
  - `investment_allocation = IF(risk_tolerance < 3, 0.3, 0.7)`
  - `retirement_contribution = IF(years_to_retirement < 10, monthly_income * 0.2, monthly_income * 0.1)`
  - Plus derived/supporting metrics: monthly surplus, debt-to-income ratio, debt payoff estimate, emergency fund target (6× monthly expenses) and progress, and a 7%-annual-return retirement growth projection.
- **Results dashboard** (`#results-section`, revealed after submit):
  - 4 stat cards: Savings Rate, Monthly Surplus, Debt-to-Income, Retirement Contribution
  - Doughnut chart of surplus allocation (Investing / Debt Payoff / Savings) with legend
  - Line chart projecting retirement balance growth year-by-year
  - Automated, personalized "Action Plan" list (dynamic copy based on inputs)
  - Debt Payoff Autopilot card with progress bar and estimated payoff time
  - Emergency Fund Status progress bar
  - "Adjust My Numbers" button to scroll back to the form
- **Insights / education section** explaining the 4 rules behind the "Autopilot Engine".
- **FAQ accordion** (privacy, DTI calculation, risk tolerance, disclaimer that this is not financial advice).
- **Footer** with financial disclaimer and copyright.
- Fully responsive layout (mobile/tablet/desktop), built with Tailwind CDN + custom CSS, Font Awesome icons, Google Fonts (Sora/Inter), and Chart.js for visualizations.
- All computation runs 100% client-side — no data is transmitted or stored anywhere.

## 🌐 Functional Entry Points

Single-page app — no query parameters needed:

| Path | Description |
|---|---|
| `/index.html` (or `/`) | The full Financial Autopilot experience: hero → planner form → results dashboard → insights → FAQ → footer |
| `#planner-section` | Anchor to the input form |
| `#results-section` | Anchor to the generated plan (hidden until the form is submitted) |
| `#insights-section` | Anchor to the "how it works" explainer |
| `#faq-section` | Anchor to the FAQ |

There are no backend API calls — the "Generate My Autopilot Plan" button runs `js/main.js`'s `computePlan()` function entirely in the browser and re-renders the DOM/Chart.js canvases.

## 🗂 Project Structure

```
index.html          Main page markup (all sections)
css/style.css        All custom styles (Tailwind CDN used for utility resets/base)
js/main.js            Form handling, calculation engine, Chart.js rendering
README.md             This file
```

## 🧮 Data Model (client-side only, no persistence)

No database/table is used — this tool has no need for stored records; every calculation is derived live from form input state:

```js
{
  monthly_income: number,
  monthly_expenses: number,
  current_savings: number,
  debt_amount: number,
  years_to_retirement: number,
  risk_tolerance: number,       // 1-5 slider
  automate_investments: boolean // toggle
}
```

## 🚧 Not Yet Implemented / Possible Enhancements

- No persistence of a user's plan (e.g., save/share a plan via URL or account) — would require the Table API if desired.
- No multi-currency support (all values assume a single currency, shown with `$`).
- No CSV/PDF export of the generated plan.
- No amortization schedule accounting for debt interest rate (current payoff estimate is a simplified linear projection with no interest).
- No login/authentication or multi-user profiles.

## ➡️ Recommended Next Steps

1. If plan-saving is desired, add a `financial_plans` table (via the Table API) keyed by a generated share code, and a "Save/Share my plan" button.
2. Add an optional debt **interest rate** input for a more accurate amortization-based payoff timeline.
3. Add light/dark mode toggle.
4. Add print/PDF export of the results dashboard (client-side, e.g. via `window.print()` with a print stylesheet).

## 🚀 Deployment

To publish this site, use the **Publish tab** in the builder — it will handle deployment and give you a live URL.
