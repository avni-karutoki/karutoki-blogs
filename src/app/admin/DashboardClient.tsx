"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LogoutButton from "./logout-button";
import DeleteConfirmation from "./delete-confirmation";
import { togglePublished, toggleMessageRead, deleteMessage, updateSiteSettings } from "./actions";

interface PostItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  published: boolean;
  created_at: string;
  scheduled_for?: string | null;
  likes?: number | null;
  views?: number | null;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface DashboardClientProps {
  userEmail: string;
  posts: PostItem[];
  messages: ContactMessage[];
  initialHeroSettings?: { title: string; subtitle: string; buttonText: string; imageUrl?: string };
  initialAboutSettings?: { title: string; subtitle: string; bio: string; imageUrl?: string };
}

export default function DashboardClient({
  userEmail,
  posts: initialPosts,
  messages: initialMessages,
  initialHeroSettings = {
    title: "Words that were never said.",
    subtitle: "A little corner for poems, stories, midnight thoughts, and everything in between.",
    buttonText: "EXPLORE",
  },
  initialAboutSettings = {
    title: "About Karutoki.",
    subtitle: "A little about the girl behind the words.",
    bio: "I am someone who finds comfort in words... Karutoki is my little corner of the internet.",
  },
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "writings" | "inbox" | "settings">("overview");
  
  // Search & Filters for Writings
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Hero & About Settings state
  const [heroForm, setHeroForm] = useState(initialHeroSettings);
  const [aboutForm, setAboutForm] = useState(initialAboutSettings);
  const [settingsStatus, setSettingsStatus] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  // Newsletter notify state
  const [notifySlug, setNotifySlug] = useState<string | null>(null);
  const [notifyMsg, setNotifyMsg] = useState("");

  // Metrics
  const totalWritings = initialPosts.length;
  const publishedCount = initialPosts.filter((p) => p.published).length;
  const draftCount = initialPosts.filter((p) => !p.published).length;
  const unreadMessagesCount = initialMessages.filter((m) => !m.read).length;
  // Note: publishDuePosts() already runs on every /admin load and flips due
  // posts to published — so anything still carrying `scheduled_for` is future.
  const scheduledCount = initialPosts.filter(
    (p) => !p.published && p.scheduled_for
  ).length;
  const totalLikes = initialPosts.reduce((sum, p) => sum + (p.likes ?? 0), 0);
  const totalViews = initialPosts.reduce((sum, p) => sum + (p.views ?? 0), 0);

  const router = useRouter();

  async function handleTogglePublished(id: string, current: boolean) {
    await togglePublished(id, current);
    router.refresh();
  }

  async function handleToggleMessageRead(id: string, current: boolean) {
    await toggleMessageRead(id, current);
    router.refresh();
  }

  async function handleDeleteMessage(id: string, name: string) {
    if (confirm(`Delete message from ${name}?`)) {
      await deleteMessage(id);
      router.refresh();
    }
  }

  // Email all newsletter subscribers about a published piece (needs RESEND_API_KEY).
  async function handleNotify(slug: string, title: string) {
    if (!confirm(`Email all subscribers about “${title}”?`)) return;
    setNotifySlug(slug);
    setNotifyMsg("");
    try {
      const res = await fetch("/api/admin/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotifyMsg(`Could not send: ${data.error || "unknown error"}`);
      } else if (data.sent === 0 && data.failed === 0) {
        setNotifyMsg("No subscribers yet — letters will send once readers sign up.");
      } else {
        setNotifyMsg(`Letter sent to ${data.sent} subscriber${data.sent === 1 ? "" : "s"}${data.failed ? ` (${data.failed} failed)` : ""} ✨`);
      }
    } catch {
      setNotifyMsg("Could not send — please try again.");
    } finally {
      setNotifySlug(null);
    }
  }

  // Filtered posts logic
  const filteredPosts = initialPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory =
      categoryFilter === "all" || post.category === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && post.published) ||
      (statusFilter === "draft" && !post.published);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handle Hero settings save
  async function handleSaveHero(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsStatus("");
    const res = await updateSiteSettings("hero", heroForm);
    setSavingSettings(false);
    if (res.success) {
      setSettingsStatus("Hero settings updated successfully ✨");
    } else {
      setSettingsStatus(`Error: ${res.error}`);
    }
  }

  // Handle About settings save
  async function handleSaveAbout(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsStatus("");
    const res = await updateSiteSettings("about", aboutForm);
    setSavingSettings(false);
    if (res.success) {
      setSettingsStatus("About settings updated successfully ✨");
    } else {
      setSettingsStatus(`Error: ${res.error}`);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] px-6 py-12 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl space-y-10">

        {/* Top Header */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border-pink)] pb-8">
          <div>
            <span className="font-sans text-xs uppercase tracking-[0.25em] text-[var(--accent-pink)] font-semibold">
              ADMIN DASHBOARD
            </span>
            <h1 className="mt-2 font-script text-4xl sm:text-5xl text-[var(--text-heading)]">
              Karutoki Studio
            </h1>
            <p className="mt-1 font-serif text-sm text-[var(--text-muted)]">
              Logged in as <span className="font-sans font-semibold text-[var(--text-primary)]">{userEmail}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/new"
              className="primary-button uppercase text-xs tracking-wider"
            >
              + New Writing
            </Link>
            <Link
              href="/"
              target="_blank"
              className="secondary-button uppercase text-xs tracking-wider"
            >
              View Site ↗
            </Link>
            <LogoutButton />
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[var(--border-color)] pb-4">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`pill-button font-sans uppercase text-xs tracking-wider ${
              activeTab === "overview" ? "active" : ""
            }`}
          >
            📊 Overview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("writings")}
            className={`pill-button font-sans uppercase text-xs tracking-wider ${
              activeTab === "writings" ? "active" : ""
            }`}
          >
            ✍️ Writings ({totalWritings})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("inbox")}
            className={`pill-button font-sans uppercase text-xs tracking-wider relative ${
              activeTab === "inbox" ? "active" : ""
            }`}
          >
            📬 Messages ({initialMessages.length})
            {unreadMessagesCount > 0 && (
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white font-bold">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`pill-button font-sans uppercase text-xs tracking-wider ${
              activeTab === "settings" ? "active" : ""
            }`}
          >
            ⚙️ Hero & About Managers
          </button>
        </div>

        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === "overview" && (
          <div className="space-y-10 animate-fadeIn">
            {/* Stat Cards Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="vintage-card p-6 rounded-2xl border border-[var(--border-pink)] bg-[var(--bg-card)]">
                <p className="font-sans text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                  Total Writings
                </p>
                <p className="mt-3 font-script text-5xl text-[var(--text-heading)]">
                  {totalWritings}
                </p>
              </div>

              <div className="vintage-card p-6 rounded-2xl border border-[var(--border-pink)] bg-[var(--bg-card)]">
                <p className="font-sans text-xs uppercase tracking-wider text-emerald-600 font-semibold">
                  Published Pieces
                </p>
                <p className="mt-3 font-script text-5xl text-[var(--text-heading)]">
                  {publishedCount}
                </p>
              </div>

              <div className="vintage-card p-6 rounded-2xl border border-[var(--border-pink)] bg-[var(--bg-card)]">
                <p className="font-sans text-xs uppercase tracking-wider text-amber-600 font-semibold">
                  Drafts
                </p>
                <p className="mt-3 font-script text-5xl text-[var(--text-heading)]">
                  {draftCount}
                </p>
              </div>

              <div className="vintage-card p-6 rounded-2xl border border-[var(--border-pink)] bg-[var(--bg-card)]">
                <p className="font-sans text-xs uppercase tracking-wider text-[var(--accent-pink)] font-semibold">
                  Unread Messages
                </p>
                <p className="mt-3 font-script text-5xl text-[var(--text-heading)]">
                  {unreadMessagesCount}
                </p>
              </div>
            </div>

            {(scheduledCount > 0 || totalLikes > 0 || totalViews > 0) && (
              <p className="font-sans text-xs text-[var(--text-muted)]">
                {scheduledCount > 0 && <span>⏳ {scheduledCount} scheduled · </span>}
                <span>♥ {totalLikes} total likes · 👁 {totalViews} total reads</span>
              </p>
            )}

            {/* Recent Activity Table */}
            <div className="vintage-card p-8 rounded-2xl border border-[var(--border-pink)] bg-[var(--bg-card)] space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-script text-3xl text-[var(--text-heading)]">
                  Recent Writings
                </h2>
                <button
                  onClick={() => setActiveTab("writings")}
                  className="font-sans text-xs font-semibold text-[var(--accent-pink)] hover:underline uppercase tracking-wider"
                >
                  View All →
                </button>
              </div>

              {initialPosts.length === 0 ? (
                <p className="font-serif text-sm text-[var(--text-muted)] py-6 text-center">
                  No writings created yet. Click &ldquo;+ New Writing&rdquo; above to write your first piece!
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs">
                    <thead>
                      <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] uppercase tracking-wider">
                        <th className="pb-3">Title</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Created</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-light)] text-[var(--text-primary)]">
                      {initialPosts.slice(0, 5).map((post) => (
                        <tr key={post.id} className="hover:bg-[var(--bg-secondary)]/50 transition">
                          <td className="py-4 font-semibold text-sm font-script text-lg text-[var(--text-heading)]">
                            {post.title}
                          </td>
                          <td className="py-4 uppercase tracking-wider text-[10px] text-[var(--accent-pink)]">
                            {post.category}
                          </td>
                          <td className="py-4">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                post.published
                                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                              }`}
                            >
                              {post.published ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td className="py-4 text-[var(--text-muted)]">
                            {new Date(post.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-4 text-right space-x-2">
                            <Link
                              href={`/admin/edit/${post.id}`}
                              className="font-semibold text-[var(--accent-pink)] hover:underline"
                            >
                              Edit
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: WRITINGS MANAGER ================= */}
        {activeTab === "writings" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Search & Filter Bar */}
            <div className="vintage-card p-6 rounded-2xl border border-[var(--border-pink)] bg-[var(--bg-card)] flex flex-col sm:flex-row gap-4 justify-between items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search writings by title or excerpt..."
                className="w-full sm:w-80 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 font-sans text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-pink)] transition"
              />

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 font-sans text-xs text-[var(--text-primary)] outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="poem">Poem</option>
                  <option value="blog">Blog</option>
                  <option value="midnight-talk">Midnight Talk</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 font-sans text-xs text-[var(--text-primary)] outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published Only</option>
                  <option value="draft">Drafts Only</option>
                </select>
              </div>
            </div>

            {/* Posts List */}
            {notifyMsg && (
              <p className="vintage-card rounded-2xl p-4 text-center font-sans text-xs font-semibold text-[var(--accent)]">
                {notifyMsg}
              </p>
            )}
            {filteredPosts.length === 0 ? (
              <div className="vintage-card p-12 text-center rounded-2xl space-y-4">
                <p className="font-script text-3xl text-[var(--text-heading)]">
                  No matching writings found.
                </p>
                <Link
                  href="/admin/new"
                  className="primary-button uppercase text-xs tracking-wider inline-flex"
                >
                  + Create New Writing
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="vintage-card p-6 sm:p-8 rounded-2xl border border-[var(--border-pink)] bg-[var(--bg-card)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition"
                  >
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-pink)]">
                          {post.category}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            post.published
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          }`}
                        >
                          {post.published ? "Published" : "Draft"}
                        </span>
                        {!post.published && post.scheduled_for && (
                          <span
                            className="rounded-full border border-sky-500/25 bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-600"
                            title={new Date(post.scheduled_for).toLocaleString()}
                          >
                            Scheduled · {new Date(post.scheduled_for).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <h2 className="font-script text-3xl text-[var(--text-heading)] truncate">
                        {post.title}
                      </h2>

                      <p className="font-sans text-xs text-[var(--text-muted)]">
                        slug: <span className="font-mono text-[11px]">/writings/{post.slug}</span>
                        {(post.likes != null || post.views != null) && (
                          <span className="ml-3">
                            ♥ {post.likes ?? 0} · 👁 {post.views ?? 0}
                          </span>
                        )}
                      </p>

                      {post.excerpt && (
                        <p className="font-serif text-sm text-[var(--text-muted)] line-clamp-2 leading-relaxed pt-1">
                          {post.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {post.published && (
                        <Link
                          href={`/writings/${post.slug}`}
                          target="_blank"
                          className="secondary-button text-xs uppercase px-4 py-2 h-9"
                        >
                          View ↗
                        </Link>
                      )}

                      <Link
                        href={`/admin/edit/${post.id}`}
                        className="secondary-button text-xs uppercase px-4 py-2 h-9"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleTogglePublished(post.id, post.published)}
                        className={`secondary-button text-xs uppercase px-4 py-2 h-9 ${
                          post.published ? "hover:border-amber-500 hover:text-amber-600" : "hover:border-emerald-500 hover:text-emerald-600"
                        }`}
                      >
                        {post.published ? "Unpublish" : "Publish"}
                      </button>

                      {post.published && (
                        <button
                          type="button"
                          onClick={() => handleNotify(post.slug, post.title)}
                          disabled={notifySlug !== null}
                          title="Email all newsletter subscribers about this piece"
                          className="secondary-button text-xs uppercase px-4 py-2 h-9 hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-50"
                        >
                          {notifySlug === post.slug ? "Sending…" : "✉ Notify"}
                        </button>
                      )}

                      <DeleteConfirmation postId={post.id} title={post.title} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: MESSAGES INBOX ================= */}
        {activeTab === "inbox" && (
          <div className="space-y-6 animate-fadeIn">
            {initialMessages.length === 0 ? (
              <div className="vintage-card p-12 text-center rounded-2xl space-y-3">
                <p className="font-script text-3xl text-[var(--text-heading)]">
                  Your inbox is quiet.
                </p>
                <p className="font-serif text-sm text-[var(--text-muted)]">
                  Contact messages submitted via the website form will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {initialMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`vintage-card p-6 sm:p-8 rounded-2xl border transition ${
                      msg.read
                        ? "border-[var(--border-color)] bg-[var(--bg-card)] opacity-80"
                        : "border-[var(--accent-pink)] bg-[var(--bg-card)] shadow-md"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-sans font-bold text-base text-[var(--text-heading)]">
                            {msg.name}
                          </h3>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                              msg.read
                                ? "bg-gray-500/10 text-gray-600"
                                : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                            }`}
                          >
                            {msg.read ? "Read" : "Unread"}
                          </span>
                        </div>
                        <p className="font-sans text-xs text-[var(--accent-pink)]">
                          {msg.email}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-sans text-xs text-[var(--text-muted)]">
                          {new Date(msg.created_at).toLocaleString()}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleMessageRead(msg.id, msg.read)}
                          className="secondary-button text-xs uppercase px-3 py-1.5 h-8"
                        >
                          {msg.read ? "Mark Unread" : "Mark Read"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg.id, msg.name)}
                          className="secondary-button text-xs uppercase px-3 py-1.5 h-8 text-rose-500 hover:border-rose-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
                      <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Subject: {msg.subject}
                      </p>
                      <p className="font-serif text-base text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: HERO & ABOUT MANAGERS ================= */}
        {activeTab === "settings" && (
          <div className="grid gap-10 md:grid-cols-2 animate-fadeIn">
            {/* Hero Manager */}
            <div className="vintage-card p-8 rounded-2xl border border-[var(--border-pink)] bg-[var(--bg-card)] space-y-6">
              <h2 className="font-script text-3xl text-[var(--text-heading)]">
                Hero Section Manager
              </h2>

              <form onSubmit={handleSaveHero} className="space-y-4 font-sans text-xs">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1">
                    Hero Main Title
                  </label>
                  <input
                    type="text"
                    value={heroForm.title}
                    onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                    required
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-pink)] font-script text-2xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1">
                    Subtitle Description
                  </label>
                  <textarea
                    value={heroForm.subtitle}
                    onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-pink)] font-serif"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={heroForm.buttonText}
                    onChange={(e) => setHeroForm({ ...heroForm, buttonText: e.target.value })}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="primary-button uppercase text-xs tracking-wider"
                  >
                    {savingSettings ? "Saving..." : "Save Hero Settings"}
                  </button>
                </div>
              </form>
            </div>

            {/* About Manager */}
            <div className="vintage-card p-8 rounded-2xl border border-[var(--border-pink)] bg-[var(--bg-card)] space-y-6">
              <h2 className="font-script text-3xl text-[var(--text-heading)]">
                About Section Manager
              </h2>

              <form onSubmit={handleSaveAbout} className="space-y-4 font-sans text-xs">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1">
                    About Section Title
                  </label>
                  <input
                    type="text"
                    value={aboutForm.title}
                    onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
                    required
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-pink)] font-script text-2xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1">
                    Sub-heading / Author Tag
                  </label>
                  <input
                    type="text"
                    value={aboutForm.subtitle}
                    onChange={(e) => setAboutForm({ ...aboutForm, subtitle: e.target.value })}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1">
                    Bio Story Text
                  </label>
                  <textarea
                    value={aboutForm.bio}
                    onChange={(e) => setAboutForm({ ...aboutForm, bio: e.target.value })}
                    rows={4}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-pink)] font-serif"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="primary-button uppercase text-xs tracking-wider"
                  >
                    {savingSettings ? "Saving..." : "Save About Settings"}
                  </button>
                </div>
              </form>

              {settingsStatus && (
                <p className="font-sans text-xs text-[var(--accent-pink)] font-semibold">
                  {settingsStatus}
                </p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
