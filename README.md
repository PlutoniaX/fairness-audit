# Fairness Audit Playbook Web App

A structured methodology and interactive tool for auditing automated decision-making systems for fairness, applied to the Australian **Robodebt** (Online Compliance Intervention) case study.

## Project Overview

The Fairness Audit Playbook is designed to help auditors, data scientists, and policy-makers systematically identify, quantify, and mitigate algorithmic bias. It uses the Robodebt scheme—a high-stakes failure of automated public administration—as a primary learning vehicle to demonstrate the impact of algorithmic choices on vulnerable populations.

### Core Methodology (C1–C4)

The app is structured around four critical components of a fairness audit:

1.  **C1: Historical Context Assessment** – Examining the institutional background and historical discrimination patterns that reach the automated system.
2.  **C2: Fairness Definition Selection** – Selecting appropriate mathematical fairness definitions based on label reliability, error impacts, and legal requirements.
3.  **C3: Bias Source Identification** – Systematically identifying and prioritizing bias types (Historical, Representation, Measurement, Aggregation, Learning, Evaluation, and Deployment).
4.  **C4: Fairness Metrics & Reporting** – Quantifying disparities with statistical validation (SPD, Error Rates) and generating actionable recommendations.

## Key Features

-   **Dual Modes**:
    -   **Learn Mode**: Follow along with pre-filled data from the Robodebt Royal Commission findings.
    -   **Audit Mode**: A blank sandbox to conduct your own fairness audit on any automated system.
-   **AI-Powered Analysis**: Optional integration with Anthropic, Google, or OpenAI models for assisted bias detection and reporting.
-   **Browser-Based Persistence**: All audit data is auto-saved locally in your browser (using `zustand` and `localStorage`).
-   **Statistical Validation**: Built-in support for bootstrap confidence intervals, permutation tests, and effect size calculations.
-   **Interactive Dashboards**: Dynamic charts and metrics for visualizing demographic disparities.

## Tech Stack

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
-   **UI Components**: [Radix UI](https://www.radix-ui.com/), [shadcn/ui](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/)
-   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
-   **Visualization**: [Recharts](https://recharts.org/)
-   **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/)

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## Project Structure

-   `src/app`: Next.js pages and API routes for each audit component.
-   `src/components`: UI components organized by feature area (shared, audit, layout).
-   `src/lib`: Core logic, including Robodebt data, mathematical calculations, and LLM utilities.
-   `src/store`: Global state management for persistent audit data.
-   `src/types`: TypeScript definitions for the audit data structures and components.

## Learn More

This project was developed as part of an AI Ethics course to provide a hands-on, interactive way to engage with complex algorithmic fairness concepts.
