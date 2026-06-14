// 默认卡通头像配置（使用 emoji + 渐变背景色）
export const DEFAULT_AVATARS = [
  { id: 'fish',     emoji: '🐟', color: '#a8d8ea' },
  { id: 'star',     emoji: '⭐', color: '#ffd670' },
  { id: 'rabbit',   emoji: '🐰', color: '#f7c5d5' },
  { id: 'dragon',   emoji: '🐲', color: '#b5ead7' },
  { id: 'penguin',  emoji: '🐧', color: '#c7ceea' },
  { id: 'cat',      emoji: '🐱', color: '#ffdac1' },
  { id: 'dog',      emoji: '🐶', color: '#e2cfc4' },
  { id: 'panda',    emoji: '🐼', color: '#d5e8d4' },
] as const;

export type AvatarId = typeof DEFAULT_AVATARS[number]['id'];

/**
 * 根据 avatarId 或 name 获取头像配置
 * - 如果 avatarId 匹配已知的默认头像 ID，返回该配置
 * - 如果 avatarId 已经是 emoji（如 🐱🐶），直接返回一个包含该 emoji 的动态配置
 * - 当 avatarId 为空时，根据 name 的 hash 值分配不同的默认头像，
 *   确保每个孩子显示不同的默认头像
 */
export function getAvatarById(avatarId: string | null | undefined, fallbackName?: string) {
  if (avatarId) {
    // 先检查是否是已知的默认头像 ID
    const known = DEFAULT_AVATARS.find(avatar => avatar.id === avatarId);
    if (known) return known;
    // 如果 avatarId 是 emoji（不在已知列表中），返回动态配置
    return { id: avatarId, emoji: avatarId, color: '#a8d8ea' };
  }
  // 根据名字 hash 选择不同的默认头像，确保不同孩子显示不同头像
  if (fallbackName) {
    let hash = 0;
    for (let i = 0; i < fallbackName.length; i++) {
      hash = ((hash << 5) - hash) + fallbackName.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    const idx = Math.abs(hash) % DEFAULT_AVATARS.length;
    return DEFAULT_AVATARS[idx];
  }
  return DEFAULT_AVATARS[0];
}
