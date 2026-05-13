export interface PageMeta {
  title: string;
  description?: string;
  slug: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  longDescription?: string;
}