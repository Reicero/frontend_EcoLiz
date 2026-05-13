/**
 * WordPress / WPGraphQL service stub.
 *
 * This module will later be wired to a real WPGraphQL endpoint.
 * For now, it exposes typed async fetchers that resolve with mock data,
 * mimicking the shape of the future API.
 */

import type { FAQItem, PageMeta } from '../types/page';
import { mockFAQ } from '../data/mockContent';

const WP_GRAPHQL_ENDPOINT =
import.meta?.env?.VITE_WP_GRAPHQL_URL ?? 'https://api.ecoliz.fr/graphql';

async function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function getFAQ(): Promise<FAQItem[]> {
  // TODO: replace with WPGraphQL query against the FAQ custom post type.
  return delay(mockFAQ);
}

export async function getPageBySlug(slug: string): Promise<PageMeta | null> {
  // TODO: replace with WPGraphQL `pageBy(uri: $slug)` query.
  return delay({
    title: slug.replace(/-/g, ' '),
    slug,
    description: 'Contenu géré dans WordPress.'
  });
}

export const wordpressEndpoint = WP_GRAPHQL_ENDPOINT;