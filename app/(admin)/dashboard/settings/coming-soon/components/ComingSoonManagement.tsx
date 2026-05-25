"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Users,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  CalendarDays,
  MessageSquare,
  Mail,
} from "lucide-react";
import RichTextEditor from "../../legal/components/RichTextEditor";

interface ComingSoonSettings {
  isEnabled: boolean;
  launchDate: string | null;
  headline: string;
  subtext: string;
  privacyNote: string;
}

interface WaitlistEntry {
  id: string;
  email: string;
  name?: string;
  subscribedAt: string;
}

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium font-['Poppins'] transition-all ${
        type === "success"
          ? "bg-[#76C043] text-white"
          : "bg-red-500 text-white"
      }`}
    >
      {type === "success" ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : (
        <XCircle className="w-4 h-4" />
      )}
      {msg}
    </div>
  );
}

function ToggleSwitch({
  enabled,
  onChange,
  loading,
}: {
  enabled: boolean;
  onChange: () => void;
  loading: boolean;
}) {
  return (
    <button
      onClick={onChange}
      disabled={loading}
      aria-label="Toggle coming soon mode"
      id="coming-soon-toggle"
      className={`relative inline-flex items-center w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#76C043] focus:ring-offset-2 ${
        enabled ? "bg-[#76C043]" : "bg-gray-300"
      } ${loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
          enabled ? "translate-x-8" : "translate-x-1"
        }`}
      />
    </button>
  );
}

const DEFAULT_SETTINGS: ComingSoonSettings = {
  isEnabled: false,
  launchDate: null,
  headline: "¡Algo emocionante está en camino!",
  subtext:
    "<p>GoGame es una experiencia sorpresa de viajes deportivos. Sé el primero en saber cuándo lanzaremos.</p>",
  privacyNote:
    "Nada de spam, nunca. Solo nos pondremos en contacto contigo cuando sea hora de jugar. 🎮",
};

export default function ComingSoonManagement() {
  const [settings, setSettings] = useState<ComingSoonSettings>(DEFAULT_SETTINGS);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [waitlistTotal, setWaitlistTotal] = useState(0);
  const [waitlistLoading, setWaitlistLoading] = useState(true);
  const [waitlistPage, setWaitlistPage] = useState(1);
  const LIMIT = 20;

  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WaitlistEntry | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch("/api/settings/coming-soon");
      const json = await res.json();

      if (json?.data) {
        setSettings({
          isEnabled: json.data.isEnabled ?? DEFAULT_SETTINGS.isEnabled,
          launchDate: json.data.launchDate
            ? new Date(json.data.launchDate).toISOString().slice(0, 16)
            : null,
          headline: json.data.headline || DEFAULT_SETTINGS.headline,
          subtext: json.data.subtext || DEFAULT_SETTINGS.subtext,
          privacyNote: json.data.privacyNote || DEFAULT_SETTINGS.privacyNote,
        });
      }
    } catch {
      showToast("Failed to load settings.", "error");
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  const fetchWaitlist = useCallback(async (page = 1) => {
    setWaitlistLoading(true);
    try {
      const res = await fetch(`/api/waitlist?page=${page}&limit=${LIMIT}`);
      const json = await res.json();
      if (json.success) {
        setWaitlist(json.entries || []);
        setWaitlistTotal(json.total || 0);
        setWaitlistPage(page);
      }
    } catch {
      showToast("Failed to load waitlist.", "error");
    } finally {
      setWaitlistLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchWaitlist(1);
  }, [fetchSettings, fetchWaitlist]);

  const saveSettings = async () => {
    setSettingsSaving(true);
    try {
      const res = await fetch("/api/settings/coming-soon", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          launchDate: settings.launchDate
            ? new Date(settings.launchDate).toISOString()
            : null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Settings saved successfully!");
      } else {
        showToast("Failed to save settings.", "error");
      }
    } catch {
      showToast("Network error.", "error");
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleToggle = async () => {
    const newVal = !settings.isEnabled;
    setSettings((prev) => ({ ...prev, isEnabled: newVal }));
    try {
      const res = await fetch("/api/settings/coming-soon", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: newVal }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(
          newVal
            ? "Coming Soon mode ENABLED"
            : "Coming Soon mode DISABLED",
        );
        if (json.data) {
          setSettings((prev) => ({ ...prev, isEnabled: json.data.isEnabled }));
        }
      } else {
        setSettings((prev) => ({ ...prev, isEnabled: !newVal }));
        showToast("Failed to update mode.", "error");
      }
    } catch {
      setSettings((prev) => ({ ...prev, isEnabled: !newVal }));
      showToast("Network error.", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/waitlist?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setWaitlist((prev) => prev.filter((e) => e.id !== deleteTarget.id));
        setWaitlistTotal((t) => t - 1);
        showToast("Email removed.");
        setDeleteTarget(null);
      }
    } catch {
      showToast("Failed to remove email.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExportCSV = () => {
    const header = "Email,Name,Subscribed At\n";
    const rows = waitlist
      .map(
        (entry) =>
          `${entry.email},${entry.name || ""},${new Date(entry.subscribedAt).toLocaleString()}`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gogame-waitlist-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(waitlistTotal / LIMIT);

  return (
    <div className="pt-4 min-h-screen mb-4 p-4">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-zinc-950 text-3xl md:text-4xl font-semibold font-['Poppins'] leading-tight pt-8">
          Coming Soon Mode
        </h1>
        <p className="text-gray-500 font-['Poppins'] text-sm">
          Control the Coming Soon landing page and manage waitlist email leads.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#76C043]/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#76C043]" />
              </div>
              <h2 className="font-semibold font-['Poppins'] text-zinc-800">
                Mode Toggle
              </h2>
            </div>

            {settingsLoading ? (
              <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ) : (
              <div
                className={`rounded-xl p-4 flex items-center justify-between border-2 transition-all ${
                  settings.isEnabled
                    ? "bg-[#76C043]/8 border-[#76C043]/30"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div>
                  <p className="font-semibold font-['Poppins'] text-zinc-800 text-sm">
                    {settings.isEnabled ? "Coming Soon Active" : "Site Live"}
                  </p>
                  <p className="text-xs text-gray-500 font-['Poppins'] mt-0.5">
                    {settings.isEnabled
                      ? "Visitors see the waiting page"
                      : "Full website accessible"}
                  </p>
                </div>
                <ToggleSwitch
                  enabled={settings.isEnabled}
                  onChange={handleToggle}
                  loading={settingsSaving}
                />
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-[#76C043]/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[#76C043]" />
              </div>
              <h2 className="font-semibold font-['Poppins'] text-zinc-800">
                Page Content
              </h2>
            </div>

            {settingsLoading ? (
              <div className="space-y-3">
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs font-semibold text-gray-500 font-['Poppins'] uppercase tracking-wider mb-1 block">
                    Headline
                  </label>
                  <input
                    id="cs-headline"
                    type="text"
                    value={settings.headline}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        headline: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-['Poppins'] text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#76C043]/40 focus:border-[#76C043]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 font-['Poppins'] uppercase tracking-wider mb-1 block">
                    Subtext
                  </label>
                  <RichTextEditor
                    value={settings.subtext}
                    onChange={(value) =>
                      setSettings((prev) => ({ ...prev, subtext: value }))
                    }
                    placeholder="Enter subtext here"
                    maxHeight="250px"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 font-['Poppins'] uppercase tracking-wider mb-1 block">
                    Privacy Note
                  </label>
                  <textarea
                    value={settings.privacyNote}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        privacyNote: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-['Poppins'] text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#76C043]/40 focus:border-[#76C043]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 font-['Poppins'] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" /> Launch Date (optional)
                  </label>
                  <input
                    id="cs-launch-date"
                    type="datetime-local"
                    value={settings.launchDate || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        launchDate: e.target.value || null,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-['Poppins'] text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#76C043]/40 focus:border-[#76C043]"
                  />
                  <p className="text-xs text-gray-400 mt-1 font-['Poppins']">
                    Enables countdown timer on the landing page
                  </p>
                </div>

                <button
                  id="cs-save-settings"
                  onClick={saveSettings}
                  disabled={settingsSaving}
                  className="w-full py-2.5 bg-[#76C043] text-white rounded-lg text-sm font-semibold font-['Poppins'] hover:bg-lime-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {settingsSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#76C043]/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-[#76C043]" />
              </div>
              <div>
                <p className="text-2xl font-bold font-['Poppins'] text-zinc-900">
                  {waitlistLoading ? "—" : waitlistTotal}
                </p>
                <p className="text-xs text-gray-500 font-['Poppins']">
                  Total Signups
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold font-['Poppins'] text-zinc-900">
                  {waitlistLoading ? "—" : waitlist.length}
                </p>
                <p className="text-xs text-gray-500 font-['Poppins']">
                  Showing this page
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold font-['Poppins'] text-zinc-800">
                Waitlist Emails
              </h2>
              <div className="flex items-center gap-2">
                <button
                  id="waitlist-refresh"
                  onClick={() => fetchWaitlist(waitlistPage)}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${waitlistLoading ? "animate-spin" : ""}`}
                  />
                </button>
                <button
                  id="waitlist-export-csv"
                  onClick={handleExportCSV}
                  disabled={waitlist.length === 0}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#76C043] text-white rounded-lg text-sm font-['Poppins'] font-medium hover:bg-lime-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              </div>
            </div>

            {waitlistLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-12 bg-gray-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : waitlist.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-['Poppins'] text-sm">
                  No waitlist signups yet.
                </p>
                <p className="text-xs mt-1">
                  Enable Coming Soon mode to start collecting emails.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left pb-3 font-semibold text-gray-500 font-['Poppins'] text-xs uppercase tracking-wider">
                          Email
                        </th>
                        <th className="text-left pb-3 font-semibold text-gray-500 font-['Poppins'] text-xs uppercase tracking-wider hidden sm:table-cell">
                          Name
                        </th>
                        <th className="text-left pb-3 font-semibold text-gray-500 font-['Poppins'] text-xs uppercase tracking-wider hidden md:table-cell">
                          Signed Up
                        </th>
                        <th className="w-10" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {waitlist.map((entry) => (
                        <tr
                          key={entry.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="py-3 font-['Poppins'] text-zinc-800">
                            {entry.email}
                          </td>
                          <td className="py-3 font-['Poppins'] text-gray-500 hidden sm:table-cell">
                            {entry.name || "—"}
                          </td>
                          <td className="py-3 font-['Poppins'] text-gray-400 text-xs hidden md:table-cell">
                            {new Date(entry.subscribedAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => setDeleteTarget(entry)}
                              className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 font-['Poppins']">
                      Page {waitlistPage} of {totalPages} · {waitlistTotal} total
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => fetchWaitlist(waitlistPage - 1)}
                        disabled={waitlistPage <= 1}
                        className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg font-['Poppins'] disabled:opacity-40 hover:bg-gray-50 transition-colors"
                      >
                        ← Prev
                      </button>
                      <button
                        onClick={() => fetchWaitlist(waitlistPage + 1)}
                        disabled={waitlistPage >= totalPages}
                        className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg font-['Poppins'] disabled:opacity-40 hover:bg-gray-50 transition-colors"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5 text-white">
              <h3 className="text-lg font-semibold font-['Poppins']">
                Remove waitlist email?
              </h3>
              <p className="mt-1 text-sm text-white/85 font-['Poppins']">
                This action will permanently remove the selected signup from the dashboard list.
              </p>
            </div>

            <div className="px-6 py-5">
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold font-['Poppins']">
                  Selected Email
                </p>
                <p className="mt-1 text-sm text-zinc-800 font-medium font-['Poppins'] break-all">
                  {deleteTarget.email}
                </p>
                {deleteTarget.name && (
                  <p className="mt-1 text-sm text-gray-500 font-['Poppins']">
                    {deleteTarget.name}
                  </p>
                )}
              </div>

              <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={() => !deleteLoading && setDeleteTarget(null)}
                  disabled={deleteLoading}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold font-['Poppins'] hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold font-['Poppins'] hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? "Removing..." : "Yes, remove"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
