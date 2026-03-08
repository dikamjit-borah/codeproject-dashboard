import { useState, useRef, useEffect, useCallback } from "react";
import { Bell, Loader2, Save } from "lucide-react";
import { fetchNotice, saveNotice } from "../../lib/appMediaService";

export default function NoticeSection() {
  const [noticeHeading, setNoticeHeading] = useState("");
  const [noticeText, setNoticeText] = useState("");
  const [loadingNotice, setLoadingNotice] = useState(true);
  const [savingNotice, setSavingNotice] = useState(false);
  const [noticeError, setNoticeError] = useState<string | null>(null);

  const savedNoticeRef = useRef({ heading: "", text: "" });

  // Load notice from Firebase on mount
  useEffect(() => {
    const load = async () => {
      setLoadingNotice(true);
      setNoticeError(null);
      try {
        const notice = await fetchNotice();
        setNoticeHeading(notice.heading);
        setNoticeText(notice.text);
        savedNoticeRef.current = { heading: notice.heading, text: notice.text };
      } catch (err) {
        console.error("Failed to load notice:", err);
        setNoticeError("Failed to load notice");
      } finally {
        setLoadingNotice(false);
      }
    };
    load();
  }, []);

  const handleNoticeHeadingChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNoticeHeading(e.target.value);
  }, []);

  const handleNoticeTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoticeText(e.target.value);
  }, []);

  const handleSaveNotice = useCallback(async () => {
    setSavingNotice(true);
    setNoticeError(null);
    try {
      await saveNotice({ heading: noticeHeading, text: noticeText });
      savedNoticeRef.current = { heading: noticeHeading, text: noticeText };
      alert("Notice saved!");
    } catch (err) {
      console.error("Save notice failed:", err);
      setNoticeError("Failed to save notice. Please try again.");
    } finally {
      setSavingNotice(false);
    }
  }, [noticeHeading, noticeText]);

  const noticeDirty =
    !loadingNotice &&
    (noticeHeading !== savedNoticeRef.current.heading ||
      noticeText !== savedNoticeRef.current.text);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
      {/* Section header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Notice</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">In-app announcement shown to all users</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSaveNotice}
          disabled={savingNotice || loadingNotice || !noticeDirty}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          {savingNotice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {savingNotice ? "Saving..." : "Save Notice"}
        </button>
      </div>

      {/* Section body */}
      <div className="p-6 space-y-5">
        {noticeError && (
          <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {noticeError}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Notice Heading */}
          <div>
            <label
              htmlFor="noticeHeading"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Heading
            </label>
            {loadingNotice ? (
              <div className="flex items-center gap-2 h-10 text-gray-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading…
              </div>
            ) : (
              <input
                id="noticeHeading"
                type="text"
                value={noticeHeading}
                onChange={handleNoticeHeadingChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter notice heading..."
              />
            )}
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              Short title displayed at the top of the notice
            </p>
          </div>

          {/* Spacer on mobile, nothing on sm+ */}
          <div className="hidden sm:block" />
        </div>

        {/* Notice Text */}
        <div>
          <label
            htmlFor="noticeText"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Body Text
          </label>
          {loadingNotice ? (
            <div className="flex items-center gap-2 h-20 text-gray-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading…
            </div>
          ) : (
            <textarea
              id="noticeText"
              rows={5}
              value={noticeText}
              onChange={handleNoticeTextChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter notice body text here..."
            />
          )}
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            Full notice message displayed in the app
          </p>
        </div>
      </div>
    </div>
  );
}
