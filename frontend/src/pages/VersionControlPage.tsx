import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Clock,
  GitBranch,
  RotateCcw,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export function VersionControlPage() {
  const { t } = useLanguage();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [compareModal, setCompareModal] = useState(false);

  const versions = [
    {
      id: 12,
      title: 'AI ne Buttons ki Styling Update ki',
      time: '3 ghante pehle',
      changes: `• Button color improve kiya
• Hover animation add ki
• Code cleanup kiya`,
    },
    {
      id: 11,
      title: 'User ne Form Code Edit kiya',
      time: 'Kal',
      changes: `• Form validation add ki
• Input fields re-arrange kiye`,
    },
    {
      id: 10,
      title: 'AI ne Layout Optimize kiya',
      time: '2 din pehle',
      changes: `• Layout spacing fix kiya
• Responsiveness improve ki`,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 w-317">
      <Header onMenuClick={() => setSidebarOpen(true)} showMenu />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">

            {/* HEADER */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center size-16 
                bg-gradient-to-br from-blue-600 to-purple-600 
                shadow-lg rounded-2xl mb-4">
                <GitBranch className="size-8 text-white" />
              </div>

              <h1 className="mb-3">Version Control</h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Aap ke project ki saari updates, AI & user edits yahan list hoti hain.
                Kisi bhi version par rollback karein ya compare karein.
              </p>
            </div>

            {/* VERSION TIMELINE */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-8">

              {/* Title */}
              <h2 className="mb-4 font-semibold text-lg">Version History</h2>

              <div className="space-y-6 relative">

                {/* Vertical Line */}
                <div className="absolute left-5 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-600 to-purple-600 opacity-30"></div>

                {versions.map((v) => (
                  <div key={v.id} className="relative">

                    {/* Dot */}
                    <div className="absolute left-2 top-4 size-6 rounded-full 
                      bg-gradient-to-br from-blue-600 to-purple-600 shadow-md"></div>

                    {/* Card */}
                    <div
                      className="ml-10 p-5 border border-gray-200 rounded-xl 
                      bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpanded(expanded === v.id ? null : v.id)}
                      >
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Version {v.id} – {v.title}
                          </h3>

                          <p className="text-gray-500 flex items-center gap-1 mt-1">
                            <Clock className="size-4" /> {v.time}
                          </p>
                        </div>

                        {expanded === v.id ? (
                          <ChevronUp className="size-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="size-5 text-gray-400" />
                        )}
                      </div>

                      {/* EXPANDED DETAILS */}
                      {expanded === v.id && (
                        <div className="mt-4 bg-gray-50 p-4 rounded-lg border">

                          <p className="text-gray-700 whitespace-pre-line">
                            {v.changes}
                          </p>

                          <div className="flex gap-3 mt-4">

                            <button
                              onClick={() => setCompareModal(true)}
                              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 
                                text-white rounded-lg hover:shadow-lg transition"
                            >
                              Compare
                            </button>

                            <button
                              className="px-4 py-2 rounded-lg 
                               !bg-red-400 !text-white 
                               hover:!bg-red-600 
                                transition flex items-center gap-2 shadow-md"
                            >
                              <RotateCcw className="size-5" />
                              Rollback
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COMPARE MODAL */}
            {compareModal && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-2xl w-full max-w-3xl shadow-2xl">

                  <h2 className="text-xl font-semibold mb-4">Compare Versions</h2>
                  <p className="text-gray-600 mb-4">
                    Button, layout, animations aur code structure mein farq neeche highlight kiya gaya hai.
                  </p>

                  <div className="bg-[#141414] text-white p-4 rounded-lg text-sm font-mono h-72 overflow-auto leading-relaxed">
                    <span className="text-green-400">+ Button hover effect added</span><br />
                    <span className="text-red-400">- Old padding removed</span><br />
                    <span className="text-green-400">+ New animation added</span><br />
                    <span className="text-yellow-300">~ Layout spacing updated</span><br />
                  </div>

                  <div className="text-right mt-4">
                    <button
                      onClick={() => setCompareModal(false)}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
                    >
                      Close
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
