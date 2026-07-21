export const WS_EVENTS = {
  CONNECTION_STATUS: "server:connection:status",
  AUTH_ERROR: "server:auth:error",

  TICKET_CREATED: "server:ticket:created",
  TICKET_UPDATED: "server:ticket:updated",

  MENU_UPDATED: "server:menu:updated",
  SERVICES_UPDATED: "server:services:updated",
  INFO_UPDATED: "server:info:updated",
  SESSION_UPDATED: "server:session:updated",
  HOUSE_UPDATED: "server:house:updated",
} as const;

export type WSEventType = typeof WS_EVENTS[keyof typeof WS_EVENTS];

export interface WSEvent<T = unknown> {
  type: WSEventType;
  payload: T;
  timestamp: string;
}
