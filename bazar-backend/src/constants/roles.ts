// Role name constants
export const ROLE_NAMES = {
    ADMIN: 'admin',
    USER: 'user',
    SELLER: 'seller'
} as const;

export type RoleName = typeof ROLE_NAMES[keyof typeof ROLE_NAMES];
