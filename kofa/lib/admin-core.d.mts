import type { PortfolioCompany } from "../data/portfolio";
import type { NewsItem } from "../data/news";
export type CompanyRecord = Omit<PortfolioCompany, "investmentYear"> & { investmentYear?: number | null; published: boolean };
export type NewsRecord = NewsItem & { published: boolean };
export interface ContentDocument { version: number; companies: CompanyRecord[]; news: NewsRecord[] }
export class AdminError extends Error { status: number; field?: string; constructor(message: string, status?: number, field?: string) }
export const SESSION_COOKIE: string;
export const SESSION_SECONDS: number;
export const MAX_CONTENT_BYTES: number;
export function authConfigured(env?: NodeJS.ProcessEnv): boolean;
export function storageConfigured(env?: NodeJS.ProcessEnv): boolean;
export function checkPassword(password: unknown, env?: NodeJS.ProcessEnv): boolean;
export function createSession(env?: NodeJS.ProcessEnv, now?: number): string;
export function validSession(value: unknown, env?: NodeJS.ProcessEnv, now?: number): boolean;
export function sameOrigin(request: Request): boolean;
export function validateRecord(kind: string, input: unknown, companySlugs: string[], now?: Date): CompanyRecord | NewsRecord;
export function mergeRecords<T extends { slug: string }>(base: T[], overrides: Partial<T>[], includeDrafts?: boolean): (T & { published: boolean })[];
export function applyRecord(document: ContentDocument, kind: string, record: CompanyRecord | NewsRecord): ContentDocument;
export function readContent(options?: { env?: NodeJS.ProcessEnv; fetchImpl?: typeof fetch; cached?: boolean }): Promise<{ document: ContentDocument; revision: string }>;
export function writeContent(document: ContentDocument, revision: string, options?: { env?: NodeJS.ProcessEnv; fetchImpl?: typeof fetch }): Promise<string>;
