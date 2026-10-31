/**
 * Approved news sources: a portfolio company's own website, or the company's
 * press release as issued on a wire service. LinkedIn posts, trade press,
 * journals and other third-party coverage are not linked from the site.
 */

/** Wire services that distribute releases written and issued by the company. */
export const WIRE_SERVICE_HOSTS = [
  "prnewswire.com",
  "businesswire.com",
  "globenewswire.com",
  "einpresswire.com",
  "prweb.com",
];

/** KOFA's own site, always official for KOFA-authored posts. */
export const KOFA_HOST = "kofahealthcare.com";

/** Official newsrooms that differ from the website listed for the company. */
export const EXTRA_OFFICIAL_HOSTS = {
  "alydia-health": ["organon.com"],
  "axena-health": ["axenahealth.com"],
};

function hostOf(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.hostname.toLowerCase().replace(/^www\./, "") : "";
  } catch {
    return "";
  }
}

const onDomain = (host, domain) => host === domain || host.endsWith(`.${domain}`);

/**
 * True when `url` is on the related company's official domain, KOFA's site,
 * or an approved wire service. `website` is the company's listed website.
 */
export function approvedNewsUrl(url, { company = "", website = "" } = {}) {
  const host = hostOf(url);
  if (!host) return false;
  const domains = [...WIRE_SERVICE_HOSTS, KOFA_HOST, ...(EXTRA_OFFICIAL_HOSTS[company] ?? [])];
  const companyHost = hostOf(website);
  if (companyHost) domains.push(companyHost);
  return domains.some((domain) => onDomain(host, domain));
}
