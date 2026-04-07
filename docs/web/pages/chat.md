# 公共聊天室（Chat）

## 路由与元信息

| 项 | 值 |
|----|-----|
| 路径 | `/chat` |
| `name` | `chat` |
| 组件文件 | `timeshards-web/src/views/front/ChatView.vue` |
| `meta.title` | `聊天室` |

## 产品定位

认证用户（站点访客身份）在 **单频道群组** 中发送消息；展示头像（渐变色 + 首字/两字）、昵称、时间、气泡；**当前实现为纯前端本地存储 + 多标签页同步**，非全网实时；预留环境变量以便未来接入 WebSocket。

## 身份：siteAuth

| Store | `src/stores/siteAuth.ts` |
|-------|--------------------------|
| 键名 | `timeshards-site-user` |
| 结构 | `{ id, nickname, joinedAt }` |
| 登录 | `login(nickname)`：2～24 字符，成功则生成新 `userId` 并持久化 |
| 退出 | `logout()` |
| 跨标签 | `initCrossTab()`：`storage` 事件触发 `syncFromStorage` |

与 **管理后台登录** 完全无关。

## 消息：chatRoom

| Store | `src/stores/chatRoom.ts` |
|-------|--------------------------|
| 键名 | `timeshards-chat-messages-v1` |
| 上限 | `MAX_MESSAGES = 400`，超出从头部丢弃（`slice(-400)`） |
| 发送 | `send(userId, nickname, text)`：trim 后非空、长度 ≤2000；`avatarHue = avatarHueFromUserId(userId)` 稳定着色 |

**跨标签：** `storage` + `timeshards-chat-sync` 自定义事件。

## WebSocket 占位

| 文件 | `src/services/chatWs.ts` |
|------|---------------------------|
| 作用 | `getChatWsUrl()` 读取 `import.meta.env.VITE_CHAT_WS_URL`；有值时页脚文案提示「可后续对接」 |

当前 **无** 实际 WS 客户端逻辑。

## UI 状态与布局

- `isAuthenticated`：未登录显示 **门闸卡片**（昵称输入 + 「进入聊天室」）；已登录显示 **房间卡片**。
- `.inner.gate-centered`：`justify-content: center`，使门闸在可视区域垂直居中。
- `.page-container.room-open`：`max-width: min(720px, 94vw)`，聊天区在宽屏更宽。
- 消息列表 `ref="listEl"`：`watch(messages.length)` + `nextTick` 滚动到底（`scrollTop = scrollHeight`）。

## 输入与快捷键

| 环境 | 行为 |
|------|------|
| 桌面（非粗指针或具备 hover） | Enter 发送；Shift+Enter 换行（`onComposerKeydown` 中 `preventDefault`） |
| 手机等 | Enter 换行；依赖「发送」按钮；`enterkeyhint="send"` |

`e.isComposing` 为真时不处理 Enter（避免输入法未上屏误发）。

## 错误提示

- 登录失败：昵称长度不符。
- 发送失败：`localStorage` 写入异常（如隐私模式）。

## 无障碍

- 消息列表 `role="log"`、`aria-live="polite"`。
- 错误信息 `role="alert"`。

## 扩展建议

- 实现 WS：连接 `VITE_CHAT_WS_URL`，收消息追加到列表，发送走网络；需处理重连、心跳、与本地缓存合并策略。
- 后端用户体系：与 `siteAuth` 解耦或映射为 JWT。

## 相关文件

- `src/views/front/ChatView.vue`
- `src/stores/siteAuth.ts`
- `src/stores/chatRoom.ts`
- `src/services/chatWs.ts`
- `env.d.ts`（`VITE_CHAT_WS_URL`）
