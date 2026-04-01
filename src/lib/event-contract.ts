export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
};

export type EventSortBy = "startsAt" | "createdAt" | "updatedAt" | "title";
export type EventSortOrder = "asc" | "desc";

export type PublicEventOwner = {
  id: string;
  name: string;
  image: string | null;
};

export type EventLocationType = "ONLINE" | "OFFLINE";
export type EventPricingType = "FREE" | "PAID";
export type EventVisibility = "PUBLIC" | "PRIVATE";

export type PublicEventCard = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  startsAt: string;
  endsAt: string | null;
  timezone: string;
  locationType: EventLocationType;
  venue: string | null;
  eventLink: string | null;
  visibility: EventVisibility;
  pricingType: EventPricingType;
  registrationFee: number;
  currency: string;
  bannerImage: string | null;
  isFeatured: boolean;
  owner: PublicEventOwner;
  requiresPayment: boolean;
  requiresApproval: boolean;
};

export type PublicEventDetail = PublicEventCard & {
  description: string;
  capacity: number | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicEventsMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PublicEventsQuery = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: EventSortBy;
  sortOrder?: EventSortOrder;
  pricingType?: EventPricingType;
  locationType?: EventLocationType;
};
