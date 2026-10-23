export type PetTheme = 'light' | 'dark';
export type AppearanceApproval = 'approved' | 'prototype' | 'revoked';

/** Immutable identity returned by the trusted server registry. Never an arbitrary media URL. */
export interface AppearanceReference {
  appearanceId: string;
  appearanceVersion: string;
  variantId: string;
  revision: string;
  approval: AppearanceApproval;
}

export interface AppearanceVariant {
  name: string;
  /** The selected image is preserved as the complete planar character. */
  referencePoster: {light: string; dark: string; width: number; height: number};
  renderer?: 'planar-poster' | 'character-frames';
}

/** App-owned, packaged allowlist. Do not deserialize this catalog from user input. */
export interface AppearanceCatalog {
  schemaVersion: 1;
  allowedPublicPaths: string[];
  appearances: Array<{
    appearanceId: string;
    appearanceVersion: string;
    approval: AppearanceApproval;
    variants: Record<string, AppearanceVariant>;
  }>;
}

export interface AppearanceRegistryAdapter {
  /** Server checks tenant/pet visibility and resolves the currently approved revision. */
  readApproved(input: {petId: string; signal: AbortSignal}): Promise<AppearanceReference>;
}

export interface AppearanceRollbackRequest {
  petId: string;
  target: Pick<AppearanceReference, 'appearanceId' | 'appearanceVersion' | 'variantId'>;
  expectedRevision: string;
  approvalId: string;
  idempotencyKey: string;
}

/** Administrative interface only. The public WebsitePet never calls this adapter. */
export interface AppearanceAdminAdapter {
  rollback(input: AppearanceRollbackRequest & {signal: AbortSignal}): Promise<AppearanceReference>;
}

export interface PetConversationAdapter {
  /** Called only after an explicit user submit and conversation.enabled === true. */
  ask(input: {
    petId: string;
    conversationId?: string;
    clientMessageId: string;
    text: string;
    appearanceRevision: string;
    signal: AbortSignal;
  }): Promise<{requestId: string; conversationId: string; text: string}>;
}

export interface PetConversationConnection {
  /** Development defaults to false. Server authorization/cost gates remain mandatory. */
  enabled: boolean;
  adapter: PetConversationAdapter;
}

const SAFE_PATH = /^[A-Za-z0-9][A-Za-z0-9_./-]*\.(?:png|webp|jpg|jpeg)$/;

export function publicPetAssetUrl(baseUrl: string, path: string, catalog: AppearanceCatalog): string {
  if (!baseUrl.startsWith('/') || baseUrl.startsWith('//') || /[\\?#\u0000]/.test(baseUrl) || baseUrl.split('/').includes('..')) {
    throw new Error('Use a trusted, same-origin, root-relative kit base URL.');
  }
  if (!SAFE_PATH.test(path) || path.split('/').includes('..') || !catalog.allowedPublicPaths.includes(path)) {
    throw new Error('Appearance path is not in the packaged allowlist.');
  }
  return `${baseUrl.replace(/\/$/, '')}/${path}`;
}

export function resolvePetAppearance(catalog: AppearanceCatalog, ref: AppearanceReference, allowPrototype = false): AppearanceVariant {
  if (catalog.schemaVersion !== 1 || !ref.revision || ref.approval === 'revoked') throw new Error('Appearance is unavailable.');
  const entry = catalog.appearances.find(a => a.appearanceId === ref.appearanceId && a.appearanceVersion === ref.appearanceVersion);
  if (!entry || entry.approval === 'revoked' || (!allowPrototype && (ref.approval !== 'approved' || entry.approval !== 'approved'))) {
    throw new Error('An approved, packaged appearance version is required.');
  }
  const variant = entry.variants[ref.variantId];
  if (!variant) throw new Error('Unknown appearance variant.');
  for (const path of [variant.referencePoster.light, variant.referencePoster.dark].filter((p): p is string => Boolean(p))) {
    publicPetAssetUrl('/', path, catalog);
  }
  return variant;
}

/** Optional admin integration helper; requires a real authenticated server adapter. */
export async function requestAppearanceRollback(
  adapter: AppearanceAdminAdapter,
  catalog: AppearanceCatalog,
  request: AppearanceRollbackRequest,
  signal: AbortSignal,
): Promise<AppearanceReference> {
  if (!request.petId || !request.expectedRevision || !request.approvalId || !request.idempotencyKey) throw new Error('Rollback approval and concurrency fields are required.');
  // Reject unknown/unapproved targets before invoking an adapter. This is not a replacement for server checks.
  resolvePetAppearance(catalog, {...request.target, revision: request.expectedRevision, approval: 'approved'});
  const result = await adapter.rollback({...request, signal});
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
  resolvePetAppearance(catalog, result);
  if (result.appearanceId !== request.target.appearanceId || result.appearanceVersion !== request.target.appearanceVersion || result.variantId !== request.target.variantId || result.revision === request.expectedRevision) {
    throw new Error('Rollback did not return the requested version with a new revision.');
  }
  return result;
}
