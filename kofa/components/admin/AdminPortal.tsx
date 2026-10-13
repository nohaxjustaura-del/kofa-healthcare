"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import type { CompanyRecord, NewsRecord } from "@/lib/admin-core.mjs";
import styles from "./AdminPortal.module.css";

type Kind = "company" | "news";
type Entry = CompanyRecord | NewsRecord;
type Draft = Record<string, string | number | boolean | null | undefined>;
type Library = { revision: string; companies: CompanyRecord[]; news: NewsRecord[] };
const categories = ["Cardiovascular", "Women's Health", "Diagnostics", "Orthopedics", "Digital Health"];
const slugify = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 140).replace(/-$/, "");

export function AdminPortal({ signedIn, configured, publishingConnected }: { signedIn: boolean; configured: boolean; publishingConnected: boolean }) {
  const [authed, setAuthed] = useState(signedIn);
  const [password, setPassword] = useState("");
  const [library, setLibrary] = useState<Library>();
  const [kind, setKind] = useState<Kind>("company");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Draft>();
  const [original, setOriginal] = useState("");
  const [creating, setCreating] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [notice, setNotice] = useState("");
  const dirty = Boolean(draft && JSON.stringify(draft) !== original);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/content", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 401) setAuthed(false);
        throw new Error(result.error);
      }
      setLibrary(result);
      return result as Library;
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "The list could not be loaded. Please try again.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (authed && publishingConnected) void load(); }, [authed, publishingConnected, load]);
  useEffect(() => {
    if (!dirty) return;
    const beforeLeave = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", beforeLeave);
    return () => window.removeEventListener("beforeunload", beforeLeave);
  }, [dirty]);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setPassword(""); setAuthed(true);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Sign-in failed. Please try again."); }
    finally { setBusy(false); }
  }

  function mayLeave() { return !dirty || window.confirm("Discard your unsaved changes?"); }

  async function signOut() {
    if (!mayLeave()) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/session", { method: "DELETE" });
      if (!response.ok) throw new Error("Sign-out failed. Please try again.");
      setAuthed(false); setLibrary(undefined); setDraft(undefined); setOriginal(""); setNotice("");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Sign-out failed."); }
    finally { setBusy(false); }
  }

  function select(entry: Entry) {
    if (!mayLeave()) return;
    const fields: Draft = {};
    for (const [key, value] of Object.entries(entry)) if (value == null || ["string", "boolean", "number"].includes(typeof value)) fields[key] = value;
    setDraft(fields); setOriginal(JSON.stringify(fields)); setCreating(false); setSlugEdited(true);
    setError(""); setFieldError(""); setNotice(""); setConflict(false);
  }

  function add() {
    if (!mayLeave()) return;
    const next: Draft = kind === "company" ? { name: "", slug: "", shortDescription: "", description: "", focus: "", website: "", category: "Cardiovascular", portfolioStatus: "Active", logo: "", logoAspect: 1, published: false,
      sortOrder: Math.max(0, ...(library?.companies.map((company) => company.sortOrder) ?? [])) + 1, featured: false }
      : { title: "", slug: "", date: new Date().toISOString().slice(0, 10), type: "KOFA News", excerpt: "", body: "", source: "", externalUrl: "", company: "", published: false };
    setDraft(next); setOriginal(JSON.stringify(next)); setCreating(true); setSlugEdited(false);
    setError(""); setFieldError(""); setNotice(""); setConflict(false);
  }

  function change(field: string, value: string | number | boolean) {
    setDraft((previous) => {
      if (!previous) return previous;
      const next = { ...previous, [field]: value };
      if ((field === "name" || field === "title") && creating && !slugEdited) next.slug = slugify(String(value));
      return next;
    });
    if (field === "slug") setSlugEdited(true);
    if (fieldError === field) { setFieldError(""); setError(""); }
    setNotice("");
  }

  async function save(published: boolean) {
    if (!draft || !library) return;
    setBusy(true); setError(""); setFieldError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/content", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, record: { ...draft, published }, revision: library.revision, create: creating }) });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 401) setAuthed(false);
        if (response.status === 409 && !result.field) setConflict(true);
        setFieldError(result.field ?? "");
        if (result.field) requestAnimationFrame(() => document.getElementById(`admin-${result.field}`)?.focus());
        throw new Error(result.error);
      }
      const saved = { ...draft, ...result.record } as Draft;
      const key = kind === "company" ? "companies" : "news";
      const entry = { ...((library[key] as Entry[]).find((item) => item.slug === draft.slug) ?? {}), ...saved };
      setLibrary({ ...library, revision: result.revision, [key]: [...(library[key] as Entry[]).filter((item) => item.slug !== saved.slug), entry] } as Library);
      setDraft(saved); setOriginal(JSON.stringify(saved)); setCreating(false); setSlugEdited(true);
      setNotice(published ? "Published. Your update is now available on the website." : "Draft saved. It stays private until you publish it.");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "The changes could not be saved. Please try again."); }
    finally { setBusy(false); }
  }

  async function reloadEntry() {
    if (!window.confirm("Reload this entry with the latest saved version? Your unsaved form changes will be discarded.")) return;
    const latest = await load();
    if (latest && draft) {
      const entries = kind === "company" ? latest.companies : latest.news;
      const entry = entries.find((item) => item.slug === draft.slug);
      if (entry) {
        const fields: Draft = {};
        for (const [key, value] of Object.entries(entry)) if (value == null || ["string", "boolean", "number"].includes(typeof value)) fields[key] = value;
        setDraft(fields); setOriginal(JSON.stringify(fields)); setConflict(false); setError("");
      }
    }
  }

  async function uploadLogo(file?: File) {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 100000) { setFieldError("logo"); setError("Choose a PNG, JPG or WebP logo up to 100 KB."); return; }
    setBusy(true);
    try {
      const data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("The logo could not be read.")); reader.readAsDataURL(file); });
      const aspect = await new Promise<number>((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image.naturalWidth / image.naturalHeight); image.onerror = () => reject(new Error("That image could not be opened. Choose another logo.")); image.src = data; });
      change("logo", data); change("logoAspect", aspect);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "The logo could not be loaded."); }
    finally { setBusy(false); }
  }

  function field(name: string, label: string, options: { multiline?: boolean; required?: boolean; type?: string; hint?: string; max?: number } = {}) {
    const props = { id: `admin-${name}`, name, value: name === "logo" && String(draft?.logo).startsWith("data:") ? "" : String(draft?.[name] ?? ""), onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => change(name, event.target.value), required: options.required, maxLength: options.max, "aria-invalid": fieldError === name || undefined, "aria-describedby": options.hint || fieldError === name ? `admin-${name}-help` : undefined };
    return <label className={styles.field} htmlFor={props.id}><span>{label}{options.required && <span className={styles.required}> (required)</span>}</span>
      {options.multiline ? <textarea {...props} rows={name === "body" ? 10 : 4} /> : <input {...props} type={options.type ?? "text"} />}
      {(options.hint || fieldError === name) && <small id={`admin-${name}-help`} className={fieldError === name ? styles.fieldError : undefined}>{fieldError === name ? error : options.hint}</small>}
    </label>;
  }

  function dropdown(name: string, label: string, choices: { value: string; label: string }[], required = true) {
    return <label className={styles.field} htmlFor={`admin-${name}`}><span>{label}{required && <span className={styles.required}> (required)</span>}</span>
      <select id={`admin-${name}`} value={String(draft?.[name] ?? "")} onChange={(event) => change(name, event.target.value)} required={required} aria-invalid={fieldError === name || undefined} aria-describedby={fieldError === name ? `admin-${name}-help` : undefined}>
        {choices.map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}
      </select>{fieldError === name && <small id={`admin-${name}-help`} className={styles.fieldError}>{error}</small>}
    </label>;
  }

  if (!authed) return <section className={styles.portal}><div className={styles.signIn}>
    <h1>Partner admin</h1><p>Add companies, keep your portfolio current, and publish news.</p>
    {!configured ? <p className={styles.message}>Partner access is being set up. Sign-in will be available once setup is complete.</p> : <form onSubmit={signIn}>
      <label className={styles.field} htmlFor="admin-password"><span>Partner password</span><input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={busy} /></label>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <button className={styles.primary} disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
    </form>}
    <Link href="/" className={styles.websiteLink}>Return to the website</Link>
  </div></section>;

  const entries: Entry[] = library ? (kind === "company" ? library.companies : library.news) : [];
  const visible = [...entries].filter((entry) => `${"name" in entry ? entry.name : entry.title} ${entry.slug}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => kind === "company" ? ("name" in a ? a.name : "").localeCompare("name" in b ? b.name : "") : ("date" in b ? b.date : "").localeCompare("date" in a ? a.date : ""));
  const noun = kind === "company" ? "company" : "article";

  return <section className={styles.portal}>
    <header className={styles.header}><div><h1>Partner admin</h1><p>Your portfolio and newsroom, in one place.</p></div><div className={styles.headerActions}><Link href="/portfolio" target="_blank" rel="noopener noreferrer">View website</Link><button className={styles.secondary} onClick={signOut} disabled={busy}>Sign out</button></div></header>
    <nav className={styles.tabs} aria-label="Manage website content">{(["company", "news"] as Kind[]).map((tab) => <button key={tab} aria-pressed={kind === tab} disabled={busy} onClick={() => { if (mayLeave()) { setKind(tab); setQuery(""); setDraft(undefined); setOriginal(""); setError(""); setNotice(""); setConflict(false); } }}>{tab === "company" ? "Portfolio" : "News"}</button>)}</nav>
    {!publishingConnected && <p className={styles.message}>Publishing is being connected. Ask the site administrator to complete setup before adding content.</p>}
    {error && !draft && <p className={styles.error} role="alert">{error} {publishingConnected && <button className={styles.textButton} onClick={() => void load()}>Try again</button>}</p>}
    <div className={styles.workspace}>
      <aside className={styles.sidebar} aria-label={kind === "company" ? "Portfolio companies" : "News articles"}>
        <button className={styles.primary} onClick={add} disabled={!library || busy}>Add {noun}</button>
        <label className={styles.search} htmlFor="admin-search"><span>Search {kind === "company" ? "companies" : "articles"}</span><input id="admin-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <p className={styles.listCount}>{loading ? "Loading…" : `${visible.length} ${kind === "company" ? "companies" : "articles"}`}</p>
        <ul className={styles.list}>{visible.map((entry) => <li key={entry.slug}><button aria-current={draft?.slug === entry.slug ? "true" : undefined} disabled={busy} onClick={() => select(entry)}><span className={styles.entryName}>{"name" in entry ? entry.name : entry.title}</span><span className={styles.entryMeta}>{"portfolioStatus" in entry ? entry.portfolioStatus : `${entry.type} · ${entry.date}`}<span className={entry.published ? styles.published : styles.draft}>{entry.published ? "Published" : "Draft"}</span></span></button></li>)}</ul>
        {!loading && library && visible.length === 0 && <p className={styles.empty}>No matches. Try another search or add a new {noun}.</p>}
      </aside>
      <div className={styles.editor}>
        {!draft ? <div className={styles.welcome}><h2>{kind === "company" ? "Keep the portfolio current." : "Share the next update."}</h2><p>Select {kind === "company" ? "a company" : "an article"} to edit, or add a new one.</p><p>Save a draft when you need more time. Publish when it is ready to appear on the website.</p></div>
        : <form onSubmit={(event) => { event.preventDefault(); void save(true); }}>
          <div className={styles.editorHeading}><h2>{creating ? `Add ${noun}` : `Edit ${noun}`}</h2><span className={styles.entryMeta}>{dirty ? "Unsaved changes" : draft.published ? "Published" : "Draft"}</span></div>
          {notice && <p className={styles.success} role="status">{notice}{draft.published && <Link href={`/${kind === "company" ? "portfolio" : "news"}/${draft.slug}`} target="_blank" rel="noopener noreferrer">View {noun}</Link>}</p>}
          {error && <p className={styles.error} role="alert">{error}{conflict && <button type="button" className={styles.textButton} onClick={() => void reloadEntry()}>Reload entry</button>}</p>}
          <fieldset disabled={busy || conflict} className={styles.fields}>
            {kind === "company" ? <>
              {field("name", "Company name", { required: true, max: 160 })}
              {field("website", "Company website", { required: true, type: "url", hint: "Include https://", max: 2000 })}
              <div className={styles.pair}>{dropdown("category", "Focus area", categories.map((value) => ({ value, label: value })))}{dropdown("portfolioStatus", "Investment status", ["Active", "Exits"].map((value) => ({ value, label: value })))}</div>
              {field("focus", "Clinical focus", { required: true, hint: "A short phrase, such as heart failure or cartilage repair.", max: 180 })}
              {field("shortDescription", "Short description", { required: true, multiline: true, hint: "Shown on the portfolio list. Keep it to one or two sentences.", max: 500 })}
              {field("description", "About the company", { required: true, multiline: true, hint: "The full description on the company page.", max: 12000 })}
              <div className={styles.pair}>{field("location", "Location", { max: 180 })}{field("investmentYear", "Investment year", { type: "number" })}</div>
              {field("status", "Exit or milestone note", { hint: "Optional. For example, Acquired by Organon.", max: 180 })}
              <div className={styles.logoField}><span className={styles.fieldLabel}>Company logo</span>{draft.logo && <img src={String(draft.logo)} alt="Selected company logo" className={styles.logoPreview} />}
                <label className={styles.upload} htmlFor="admin-logo-upload">Upload a logo<input id="admin-logo-upload" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void uploadLogo(event.target.files?.[0])} /></label><small>PNG, JPG or WebP, up to 100 KB. A logo is optional.</small>
                {field("logo", "Or use an image address", { hint: draft.logo?.toString().startsWith("data:") ? "An uploaded logo is selected. Replace it by uploading another image." : "Paste an https:// image address, or leave blank to show the company name." })}
                {draft.logo && <button type="button" className={styles.textButton} onClick={() => { change("logo", ""); change("logoAspect", 1); }}>Remove logo</button>}
              </div>
            </> : <>
              {field("title", "Article title", { required: true, max: 300 })}
              <div className={styles.pair}>{dropdown("type", "News category", ["KOFA News", "Portfolio News"].map((value) => ({ value, label: value })))}{field("date", "Publication date", { required: true, type: "date" })}</div>
              {dropdown("company", "Related company", [{ value: "", label: draft.type === "Portfolio News" ? "Choose a company" : "No related company" }, ...(library?.companies.filter((company) => company.published).map((company) => ({ value: company.slug, label: company.name })) ?? [])], draft.type === "Portfolio News")}
              <p className={styles.hint}>Linking a company also adds this article to its portfolio page. Portfolio News appears for 12 months; KOFA News remains available.</p>
              {field("excerpt", "Short summary", { required: true, multiline: true, hint: "Shown in the newsroom and beneath the headline.", max: 2000 })}
              {field("externalUrl", "Original article link", { type: "url", hint: "For coverage from another publisher, paste its https:// article address.", max: 2000 })}
              {field("source", "Original publisher", { hint: "Required when linking to an external article.", max: 180 })}
              {field("body", "Write an article", { multiline: true, hint: "For KOFA-authored news, write here instead of adding an external link. Leave a blank line between paragraphs.", max: 40000 })}
            </>}
            {creating ? field("slug", "Page address", { required: true, hint: "Created from the name. You can change it before the first save.", max: 160 }) : <p className={styles.hint}>Page address: /{kind === "company" ? "portfolio" : "news"}/{draft.slug}</p>}
          </fieldset>
          <div className={styles.saveBar}><button className={styles.primary} type="submit" disabled={busy || conflict}>{busy ? "Saving…" : draft.published ? "Save changes" : `Publish ${noun}`}</button><button className={styles.secondary} type="button" onClick={() => void save(false)} disabled={busy || conflict}>{draft.published ? "Move to draft" : "Save draft"}</button><span>{draft.published ? "Changes appear on the website when saved." : "Drafts stay private."}</span></div>
        </form>}
      </div>
    </div>
  </section>;
}
