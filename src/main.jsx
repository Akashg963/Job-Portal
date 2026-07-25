import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";
import { shadesOfPurple } from "@clerk/themes";

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const missingEnvVars = [
  ["VITE_CLERK_PUBLISHABLE_KEY", PUBLISHABLE_KEY],
  ["VITE_SUPABASE_URL", import.meta.env.VITE_SUPABASE_URL],
  ["VITE_SUPABASE_ANON_KEY", import.meta.env.VITE_SUPABASE_ANON_KEY],
].filter(([, value]) => !value);

function SetupRequired() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <section className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-3xl flex-col justify-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-300">
          Setup required
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight">
          Add your Clerk and Supabase keys to run the Job Portal.
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-300">
          The frontend is loading correctly, but it cannot connect to auth or
          the database until these Vite environment variables exist in the root
          project folder.
        </p>
        <div className="mt-6 rounded-md border border-slate-700 bg-slate-900 p-5">
          <p className="mb-3 text-sm font-medium text-slate-200">
            Create or update this file:
          </p>
          <code className="block rounded bg-slate-950 px-3 py-2 text-sm text-cyan-200">
            C:\Users\Akash963\Downloads\job-portal-master\.env
          </code>
          <pre className="mt-4 overflow-x-auto rounded bg-slate-950 p-4 text-sm text-slate-100">
            {`VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key`}
          </pre>
        </div>
        <p className="mt-5 text-sm text-slate-400">
          Missing now: {missingEnvVars.map(([name]) => name).join(", ")}
        </p>
      </section>
    </main>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    {missingEnvVars.length ? (
      <SetupRequired />
    ) : (
      <ClerkProvider
        appearance={{
          baseTheme: shadesOfPurple,
        }}
        publishableKey={PUBLISHABLE_KEY}
        afterSignOutUrl="/"
      >
        <App />
      </ClerkProvider>
    )}
  </React.StrictMode>
);
