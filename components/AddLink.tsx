import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import { analyzeContent } from "../services/geminiService";
import { LinkIcon, PlusIcon } from "./icons";
import { type User } from "../types";

// **IMPORTANT NOTE ON CONTENT FETCHING**
// This function fetches website content directly from the browser using a public CORS proxy.
// This is suitable for a demo but has limitations:
// 1. **Reliability:** Public proxies can be slow, rate-limited, or go down. We've chosen one
//    that is generally more stable, but issues can still occur.
// 2. **Security:** Sending URLs through a third-party proxy has security implications.
// 3. **Effectiveness:** The content extraction is based on heuristics and may not work for all websites,
//    especially complex single-page applications (SPAs).
// In a production application, this functionality should be moved to a secure backend service
// (e.g., a Cloud Function) that can fetch, parse, and clean content reliably.
const fetchAndCleanContent = async (url: string): Promise<string> => {
  console.log(`Fetching and cleaning content for: ${url}`);

  // Using a public CORS proxy to bypass browser restrictions.
  // Switched to a Cloudflare worker-based proxy for better reliability.
  const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `The proxy server responded with an error: ${response.status} ${
          response.statusText
        }. This usually means the target website is blocking the request. Details: ${errorText.slice(
          0,
          200
        )}`
      );
    }
    const html = await response.text();

    // Use DOMParser to convert HTML string to a document
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Remove unwanted elements that are typically not part of the main content
    doc
      .querySelectorAll(
        'script, style, link, noscript, header, footer, nav, aside, form, iframe, [aria-hidden="true"]'
      )
      .forEach((el) => el.remove());

    // Try to identify the main content area of the page
    let mainContent = doc.querySelector('article, main, [role="main"]');
    if (!mainContent) {
      mainContent = doc.body;
    }

    let textContent = mainContent.textContent || "";

    // Clean up whitespace and line breaks for a cleaner input to the AI model
    textContent = textContent.replace(/\s\s+/g, " ").trim();

    if (!textContent) {
      throw new Error(
        "Could not extract any readable content from the URL. The page might be empty or built in a way that prevents content extraction."
      );
    }

    // Truncate content to a reasonable length to avoid overly large API requests
    const MAX_LENGTH = 15000;
    if (textContent.length > MAX_LENGTH) {
      return textContent.substring(0, MAX_LENGTH) + "... [Content Truncated]";
    }

    return textContent;
  } catch (error) {
    console.error("Error in fetchAndCleanContent:", error);
    if (error instanceof Error) {
      // Provide more specific feedback for the "Failed to fetch" network error.
      if (error.message.includes("Failed to fetch")) {
        throw new Error(
          "Network Error: Could not fetch the URL. This might be a temporary network issue, or the content proxy may be down. Please check your connection and try again."
        );
      }
      // Re-throw other errors with a clear message.
      throw new Error(
        `Failed to process content from the URL. (${error.message})`
      );
    }
    throw new Error("An unknown error occurred while fetching content.");
  }
};

interface AddLinkProps {
  user: User;
}

const AddLink: React.FC<AddLinkProps> = ({ user }) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !user) return;

    // Basic URL validation
    try {
      new URL(url);
    } catch (_) {
      setError("Please enter a valid URL.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch and clean content (using CORS proxy)
      const articleText = await fetchAndCleanContent(url);

      // 2. Analyze with Gemini
      const analysis = await analyzeContent(articleText);

      // 3. Save to Firestore, associated with the current user
      await addDoc(collection(db, "links"), {
        userId: user.uid, // Add user's ID
        url: url,
        title: analysis.title,
        summary: analysis.summary,
        tags: analysis.tags,
        createdAt: serverTimestamp(),
      });

      setUrl(""); // Clear input on success
    } catch (err) {
      console.error("Error adding link:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/60 p-6 rounded-xl shadow-lg border border-gray-700">
      <form onSubmit={handleSubmit}>
        <label
          htmlFor="url-input"
          className="block text-sm font-medium text-gray-400 mb-2"
        >
          Add a new link
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <LinkIcon className="h-5 w-5 text-gray-500" />
            </div>
            <input
              id="url-input"
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              placeholder="https://example.com/article"
              className="block w-full rounded-md border-0 bg-gray-900/50 py-3 pl-10 pr-4 text-gray-200 ring-1 ring-inset ring-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 transition-colors"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-x-2 rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            disabled={loading || !url.trim()}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                Analyzing...
              </>
            ) : (
              <>
                <PlusIcon className="h-5 w-5" />
                Add & Analyze
              </>
            )}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </form>
    </div>
  );
};

export default AddLink;
