import React, { useState } from 'react';

// Mock UI Component for Mini-Foundry Dashboard (Next.js / React)

export default function MiniFoundryDashboard() {
  const [view, setView] = useState('developer'); // 'developer' or 'admin'
  const [apiKey] = useState('mf_live_demo12345');

  const copySnippet = () => {
    const snippet = `
from openai import OpenAI

client = OpenAI(
    base_url="https://api.minifoundry.internal/v1",
    api_key="${apiKey}" 
)

response = client.chat.completions.create(
    model="claude-3-haiku", 
    messages=[{"role": "user", "content": "Hello"}],
)
    `;
    navigator.clipboard.writeText(snippet);
    alert('Snippet copied to clipboard with your API key!');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <header className="flex justify-between items-center border-b border-gray-700 pb-4 mb-8">
        <h1 className="text-2xl font-bold">Mini-Foundry Platform</h1>
        <div>
          <button 
            onClick={() => setView('developer')}
            className={`px-4 py-2 mr-2 rounded ${view === 'developer' ? 'bg-blue-600' : 'bg-gray-800'}`}
          >
            Developer View
          </button>
          <button 
            onClick={() => setView('admin')}
            className={`px-4 py-2 rounded ${view === 'admin' ? 'bg-blue-600' : 'bg-gray-800'}`}
          >
            Platform Admin View
          </button>
        </div>
      </header>

      {view === 'developer' ? (
        <section className="space-y-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl mb-4">🚀 Quickstart Snippet</h2>
            <p className="text-gray-400 mb-4">Your API key is automatically injected below. Do not commit this to version control.</p>
            <div className="relative bg-black p-4 rounded text-sm font-mono overflow-x-auto">
              <code>{`from openai import OpenAI\n\nclient = OpenAI(\n    base_url="https://api.minifoundry.internal/v1",\n    api_key="${apiKey}" \n)`}</code>
              <button 
                onClick={copySnippet}
                className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-xs"
              >
                Copy Code
              </button>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl mb-4">🔍 Request Logs (Paginated)</h2>
            <div className="flex space-x-2 mb-4">
              <button className="bg-blue-900 text-blue-300 px-3 py-1 rounded text-sm">All</button>
              <button className="bg-green-900 text-green-300 px-3 py-1 rounded text-sm">2xx Success</button>
              <button className="bg-red-900 text-red-300 px-3 py-1 rounded text-sm">5xx Upstream</button>
            </div>
            {/* Table Mock */}
            <table className="w-full text-left text-sm text-gray-300">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">Model</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Trace ID (Searchable)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2">2026-05-18 10:31:00</td>
                  <td className="py-2">claude-3-haiku</td>
                  <td className="py-2 text-green-400">200 OK</td>
                  <td className="py-2 font-mono text-xs text-gray-500">mf_trc_98a7sd98f7</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="space-y-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-gray-400 text-sm">Total AI Spend (MTD)</h3>
              <p className="text-3xl font-bold mt-2">$42,105.00</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-gray-400 text-sm">Active Developers</h3>
              <p className="text-3xl font-bold mt-2">124</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-gray-400 text-sm">Global P99 Latency</h3>
              <p className="text-3xl font-bold mt-2">840ms</p>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl mb-4">💡 Optimization Insights</h2>
            <p className="text-sm text-gray-400 mb-4">Based on metadata heuristics (high prompt/completion token ratios). No prompt content is read.</p>
            <div className="bg-yellow-900 border-l-4 border-yellow-500 p-4 mb-4 flex justify-between items-center">
              <div>
                <p className="text-yellow-200"><strong>Search Team</strong> is using <code>gpt-4o</code> for tasks averaging 50 completion tokens.</p>
                <p className="text-sm text-yellow-400">Estimated Savings: $4,000/mo if migrated to <code>claude-3-haiku</code>.</p>
              </div>
              <a 
                href="mailto:alex@company.com?subject=Mini-Foundry Model Optimization&body=Hey Alex, Mini-Foundry noticed Project Search could save $4,000/mo by switching model=gpt-4o to model=claude-3-haiku in your base URL. Thoughts?"
                className="bg-yellow-700 hover:bg-yellow-600 text-white px-4 py-2 rounded text-sm transition"
              >
                Notify Owner
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
