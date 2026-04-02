/** 作品集数据源：在此增删项目即可更新页面 */

export type PortfolioLink = {
  label: string
  href: string
}

export type PortfolioProject = {
  id: string
  title: string
  /** 年份或时间段 */
  period: string
  summary: string
  tags: string[]
  links?: PortfolioLink[]
  /** 右页展示图：可放在 public/ 下，如 /portfolio/project-name.png */
  image?: string
  /** 右页图片说明（可选） */
  showcaseNote?: string
}

export const portfolioProjects: PortfolioProject[] = [
  {
    id: 'timeshards',
    title: 'TimeShards',
    period: '2025 — 至今',
    summary:
      '个人站点：首页、作品集、博客与留言等模块，采用玻璃拟态界面与全局动态背景，作为学习与作品展示的载体。',
    tags: ['Vue 3', 'TypeScript', 'Vite', 'Pinia'],
    links: [
      { label: '本站', href: '/' },
      // { label: '源码', href: 'https://github.com/你的用户名/TimeShards' },
    ],
  },
  {
    id: 'sample-1',
    title: '示例项目 · 可替换',
    period: '2024',
    summary: '将标题、简介、标签与链接改成你的真实项目即可；支持多个外链（如演示站、仓库、文档）。',
    tags: ['占位', '待填写'],
    links: [{ label: '演示', href: 'https://example.com' }],
    showcaseNote: '在 portfolio.ts 中为项目设置 image 字段即可显示截图。',
  },
  {
    id: 'sample-2',
    title: '另一个占位卡片',
    period: '2023 — 2024',
    summary: '若项目较多，可继续在本数组中追加条目；书本会按顺序生成跨页。',
    tags: ['Vue', 'Node'],
  },
]
