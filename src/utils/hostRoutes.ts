// 주최자 화면 경로

export const HOST_ROUTES = {
  login: '/host/login',
  oauthCallback: '/oauth/callback',
  events: '/host/events',
  eventCreate: '/host/events/new',
  eventDetail: (eventId: number | string): string => `/host/events/${eventId}`,
} as const;