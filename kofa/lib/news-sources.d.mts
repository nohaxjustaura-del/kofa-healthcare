export const WIRE_SERVICE_HOSTS: string[];
export const KOFA_HOST: string;
export const EXTRA_OFFICIAL_HOSTS: Record<string, string[]>;
export function approvedNewsUrl(url: string | undefined, options?: { company?: string; website?: string }): boolean;
