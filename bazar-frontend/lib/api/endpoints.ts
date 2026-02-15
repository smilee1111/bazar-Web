//List of api routes
//single source of truth for api endpoints 

export const API = {
    AUTH:{
        LOGIN: 'api/auth/login',
        REGISTER: 'api/auth/register',
        WHOAMI: 'api/auth/whoami',
        UPDATEPROFILE:'/api/auth/update-profile',
        REQUEST_PASSWORD_RESET: '/api/auth/request-password-reset',
        RESET_PASSWORD: (token: string) => `/api/auth/reset-password/${token}`,
    },
    ROLES: {
        GET_ALL: 'api/roles',
    },
    CATEGORIES: {
        GET_ALL: 'api/categories',
    },
    ADMIN_USERS: {
        CREATE_USER: 'api/admin/users/register-admin',
        GET_ALL_USERS: 'api/admin/users',
        GET_USER_BY_ID: 'api/admin/users/:id',
        UPDATE_USER: 'api/admin/users/:id',
        DELETE_USER: 'api/admin/users/:id',
    },
    USERS_SELF: {
        UPDATE_PROFILE: '/api/user/update-profile',
        GET_USER_PROFILE: '/api/user/whoami',
    },
    USER_SELLER_APPLICATIONS: {
        CREATE_APPLICATION: '/api/user/seller-applications',
        GET_MY_APPLICATION: '/api/user/seller-applications/my',
    },
    SHOPS: {
        CREATE_SHOP: 'api/seller/shops',
        GET_ALL_SHOPS: 'api/seller/shops',
        GET_MY_SHOP: 'api/seller/shops/my',
        GET_SHOP_BY_ID: (id: string) => `api/seller/shops/${id}`,
        UPDATE_SHOP: (id: string) => `api/seller/shops/${id}`,
        DELETE_SHOP: (id: string) => `api/seller/shops/${id}`,
    },
    ADMIN_SHOPS: {
        GET_ALL_SHOPS: 'api/admin/shops',
        CREATE_SHOP: 'api/admin/shops',
        GET_SHOP_BY_ID: (id: string) => `api/admin/shops/${id}`,
        UPDATE_SHOP: (id: string) => `api/admin/shops/${id}`,
        DELETE_SHOP: (id: string) => `api/admin/shops/${id}`,
    },
    SELLER_APPLICATIONS: {
        CREATE_APPLICATION: 'api/admin/seller-applications',
        GET_ALL_APPLICATIONS: 'api/admin/seller-applications',
        GET_PENDING_APPLICATIONS: 'api/admin/seller-applications/pending',
        GET_APPLICATION_BY_ID: (id: string) => `api/admin/seller-applications/${id}`,
        APPROVE_APPLICATION: (id: string) => `api/admin/seller-applications/${id}/approve`,
        REJECT_APPLICATION: (id: string) => `api/admin/seller-applications/${id}/reject`,
        UPDATE_APPLICATION: (id: string) => `api/admin/seller-applications/${id}`,
        DELETE_APPLICATION: (id: string) => `api/admin/seller-applications/${id}`,
    },
    SHOP_REVIEWS: {
        GET_BY_SHOP: (shopId: string) => `api/shops/${shopId}/reviews`,
    },
    SHOP_PHOTOS: {
        GET_BY_SHOP: (shopId: string) => `api/shops/${shopId}/photos`,
    },
}