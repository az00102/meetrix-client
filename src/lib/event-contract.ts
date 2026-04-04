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

export type EventAccessPaymentStatus =
  | "PENDING"
  | "PAID"
  | "UNPAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type EventAccessParticipantStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "BANNED"
  | "CANCELLED";

export type EventAccessInvitationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "DECLINED"
  | "EXPIRED"
  | "CANCELLED";

export type EventAccessJoinType = "DIRECT" | "REQUEST" | "INVITED";
export type EventAccessPaymentPurpose =
  | "EVENT_REGISTRATION"
  | "INVITATION_ACCEPTANCE";
export type EventAccessPaymentProvider = "SSLCOMMERZ" | "SHURJOPAY" | "MANUAL";
export type EventAccessPrimaryAction =
  | "LOG_IN"
  | "MANAGE_EVENT"
  | "VIEW_PARTICIPATION"
  | "VIEW_INVITATIONS"
  | "JOIN_EVENT"
  | "REQUEST_ACCESS"
  | "PAY_TO_REQUEST_ACCESS"
  | "PAY_INVITATION"
  | "ACCEPT_INVITATION"
  | "COMPLETE_PAYMENT"
  | "NONE";

export type EventAccessViewer = {
  isAuthenticated: boolean;
  userId: string | null;
  isHost: boolean;
  canManageEvent: boolean;
};

export type EventAccessInviter = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export type EventAccessApprover = {
  id: string;
  name: string;
  email: string;
};

export type PublicEventAccessInvitation = {
  id: string;
  status: EventAccessInvitationStatus;
  paymentStatus: EventAccessPaymentStatus;
  message: string | null;
  expiresAt: string | null;
  respondedAt: string | null;
  acceptedAt: string | null;
  declinedAt: string | null;
  createdAt: string;
  updatedAt: string;
  invitedBy: EventAccessInviter;
};

export type PublicEventAccessParticipation = {
  id: string;
  joinType: EventAccessJoinType;
  status: EventAccessParticipantStatus;
  paymentStatus: EventAccessPaymentStatus;
  approvalNote: string | null;
  rejectionReason: string | null;
  respondedAt: string | null;
  approvedAt: string | null;
  joinedAt: string | null;
  bannedAt: string | null;
  createdAt: string;
  updatedAt: string;
  approvedBy: EventAccessApprover | null;
};

export type PublicEventAccessPayment = {
  id: string;
  purpose: EventAccessPaymentPurpose;
  provider: EventAccessPaymentProvider;
  amount: number;
  currency: string;
  status: EventAccessPaymentStatus;
  providerTransactionId: string | null;
  gatewayStatus: string | null;
  failureReason: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  redirectUrl: string | null;
  manualReviewReason: string | null;
  requiresManualReview: boolean;
};

export type PublicEventAccessState = {
  event: PublicEventDetail;
  viewer: EventAccessViewer;
  participation: PublicEventAccessParticipation | null;
  invitation: PublicEventAccessInvitation | null;
  latestPayment: PublicEventAccessPayment | null;
  accessState: {
    state: string;
    primaryAction: EventAccessPrimaryAction;
    reason: string | null;
  };
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
