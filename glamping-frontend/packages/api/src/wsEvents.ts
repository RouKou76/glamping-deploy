export const WS_EVENTS = {
  CONNECT: "client:connect",
  DISCONNECT: "client:disconnect",
  TASK_CREATE: "client:task:create",
  TASK_UPDATE: "client:task:update",
  TASK_CANCEL: "client:task:cancel",
  MESSAGE_SEND: "client:message:send",
  MESSAGE_READ: "client:message:read",
  GATE_REQUEST: "client:gate:request",
  GATE_RESPONSE: "client:gate:response",

  TASK_CREATED: "server:task:created",
  TASK_UPDATED: "server:task:updated",
  TASK_CANCELLED: "server:task:cancelled",
  MESSAGE_RECEIVED: "server:message:received",
  MESSAGE_READ_UPDATE: "server:message:read:update",
  GATE_ALERT: "server:gate:alert",
  GATE_RESPONSE_SENT: "server:gate:response:sent",
  HOUSE_UPDATED: "server:house:updated",
  MENU_UPDATED: "server:menu:updated",
  SERVICES_UPDATED: "server:services:updated",
  SETTINGS_UPDATED: "server:settings:updated",
  CONNECTION_STATUS: "server:connection:status",
} as const;

export type WSEventType = typeof WS_EVENTS[keyof typeof WS_EVENTS];

export interface WSEvent<T = unknown> {
  type: WSEventType;
  payload: T;
  timestamp: string;
}

export interface TaskCreatePayload {
  houseId: string;
  type: string;
  items?: { menuItemId: string; name: string; price: number; quantity: number }[];
  location?: string;
  geo?: string;
  desiredAt?: string;
  description?: string;
}

export interface TaskUpdatePayload {
  taskId: string;
  status: string;
  assignedTo?: string;
}

export interface MessageSendPayload {
  houseId: string;
  text: string;
}

export interface GateRequestPayload {
  houseId: string;
}

export interface GateResponsePayload {
  taskId: string;
  approved: boolean;
}
