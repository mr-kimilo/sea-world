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
 * 根据 avatarId 获取头像配置
 */
export function getAvatarById(avatarId: string | null | undefined) {
  if (!avatarId) return DEFAULT_AVATARS[0];
  return DEFAULT_AVATARS.find(avatar => avatar.id === avatarId) || DEFAULT_AVATARS[0];
}
