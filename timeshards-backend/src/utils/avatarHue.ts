/** 与 timeshards-web/src/stores/chatRoom.ts 中 avatarHueFromUserId 一致 */
export function avatarHueFromUserId(userId: string): number {
  let h = 0
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) >>> 0
  return h % 360
}
