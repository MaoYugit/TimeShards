/**
 * 可选：接入自建 WebSocket 聊天服务时配置 VITE_CHAT_WS_URL。
 * 协议需与后端约定；未配置时聊天室使用 localStorage + 多标签 storage 同步（仅本机）。
 */

export type ChatWsInbound =
  | { type: 'message'; payload: Record<string, unknown> }
  | { type: 'ping' }

export function getChatWsUrl(): string | undefined {
  const u = import.meta.env.VITE_CHAT_WS_URL
  return typeof u === 'string' && u.length > 0 ? u : undefined
}
