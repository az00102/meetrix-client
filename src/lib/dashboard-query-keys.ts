const dashboardQueryKeys = {
  myEvents: (query: unknown) => ["my-events", query] as const,
  eventParticipants: (eventId: string, query: unknown) =>
    ["event-participants", eventId, query] as const,
  myParticipations: (query: unknown) => ["my-participations", query] as const,
  myInvitations: (query: unknown) => ["my-invitations", query] as const,
  sentInvitations: (query: unknown) => ["sent-invitations", query] as const,
  myPayments: (query: unknown) => ["my-payments", query] as const,
  paymentDetail: (paymentId: string) => ["payment-detail", paymentId] as const,
};

export { dashboardQueryKeys };
