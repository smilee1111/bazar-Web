//List of api routes
//single source of truth for api endpoints 

export const API = {
    AUTH:{
        LOGIN: 'auth/login',
        REGISTER: 'auth/register',
        WHOAMI: 'auth/whoami',
        UPDATEPROFILE:'auth/update-profile',
        REQUEST_PASSWORD_RESET: 'auth/request-password-reset',
        RESET_PASSWORD: (token: string) => `auth/reset-password/${token}`,
    },
    ROLES: {
        GET_ALL: 'roles',
    },
    CATEGORIES: {
        GET_ALL: 'categories',
    },
    ADMIN_USERS: {
        CREATE_USER: 'admin/users/register-admin',
        GET_ALL_USERS: 'admin/users',
        GET_USER_BY_ID: 'admin/users/:id',
        UPDATE_USER: 'admin/users/:id',
        DELETE_USER: 'admin/users/:id',
    },
    USERS_SELF: {
        UPDATE_PROFILE: 'user/update-profile',
        GET_USER_PROFILE: 'user/whoami',
    },
    USER_SELLER_APPLICATIONS: {
        CREATE_APPLICATION: 'user/seller-applications',
        GET_MY_APPLICATION: 'user/seller-applications/my',
        UPLOAD_DOCUMENT: 'user/seller-applications/upload-document',
    },
    USER_SAVED_SHOPS: {
        LIST: 'user/saved-shops',
        CREATE: 'user/saved-shops',
        DELETE: (shopId: string) => `user/saved-shops/${shopId}`,
    },
    USER_FAVOURITES: {
        LIST: 'user/favourites',
        CREATE: 'user/favourites',
        DELETE: (shopId: string) => `user/favourites/${shopId}`,
    },
    USER_REVIEWS: {
        LIST: 'user/reviews',
    },
    SHOPS: {
        CREATE_SHOP: 'seller/shops',
        GET_ALL_SHOPS: 'seller/shops',
        GET_MY_SHOP: 'seller/shops/my',
        GET_SHOP_BY_ID: (id: string) => `seller/shops/${id}`,
        UPDATE_SHOP: (id: string) => `seller/shops/${id}`,
        DELETE_SHOP: (id: string) => `seller/shops/${id}`,
    },
    PUBLIC_SHOPS: {
        GET_FEED: 'shops/public',
        GET_BY_ID: (id: string) => `shops/public/${id}`,
        GET_ROUTE: (id: string) => `shops/public/${id}/route`,
    },
    ADMIN_SHOPS: {
        GET_ALL_SHOPS: 'admin/shops',
        CREATE_SHOP: 'admin/shops',
        GET_SHOP_BY_ID: (id: string) => `admin/shops/${id}`,
        UPDATE_SHOP: (id: string) => `admin/shops/${id}`,
        DELETE_SHOP: (id: string) => `admin/shops/${id}`,
    },
    SELLER_APPLICATIONS: {
        CREATE_APPLICATION: 'admin/seller-applications',
        GET_ALL_APPLICATIONS: 'admin/seller-applications',
        GET_PENDING_APPLICATIONS: 'admin/seller-applications/pending',
        GET_APPLICATION_BY_ID: (id: string) => `admin/seller-applications/${id}`,
        APPROVE_APPLICATION: (id: string) => `admin/seller-applications/${id}/approve`,
        REJECT_APPLICATION: (id: string) => `admin/seller-applications/${id}/reject`,
        UPDATE_APPLICATION: (id: string) => `admin/seller-applications/${id}`,
        DELETE_APPLICATION: (id: string) => `admin/seller-applications/${id}`,
    },
    SHOP_REVIEWS: {
        GET_BY_SHOP: (shopId: string) => `shops/${shopId}/reviews`,
        CREATE: (shopId: string) => `shops/${shopId}/reviews`,
        UPDATE: (shopId: string, reviewId: string) => `shops/${shopId}/reviews/${reviewId}`,
        DELETE: (shopId: string, reviewId: string) => `shops/${shopId}/reviews/${reviewId}`,
    },
    SHOP_PHOTOS: {
        GET_BY_SHOP: (shopId: string) => `shops/${shopId}/photos`,
        CREATE: (shopId: string) => `shops/${shopId}/photos`,
        DELETE: (shopId: string, photoId: string) => `shops/${shopId}/photos/${photoId}`,
    },
    SHOP_DETAILS: {
        GET_BY_SHOP: (shopId: string) => `shops/${shopId}/details`,
        GET_BY_ID: (shopId: string, detailId: string) => `shops/${shopId}/details/${detailId}`,
        CREATE: (shopId: string) => `shops/${shopId}/details`,
        UPDATE: (shopId: string, detailId: string) => `shops/${shopId}/details/${detailId}`,
        DELETE: (shopId: string, detailId: string) => `shops/${shopId}/details/${detailId}`,
    },
    ADMIN_SHOP_REVIEWS: {
        GET_BY_SHOP: (shopId: string) => `admin/shop-reviews/${shopId}`,
        DISABLE: (reviewId: string) => `admin/shop-reviews/${reviewId}/disable`,
        DELETE: (reviewId: string) => `admin/shop-reviews/${reviewId}`,
    },
    ADMIN_SHOP_PHOTOS: {
        GET_BY_SHOP: (shopId: string) => `admin/shop-photos/${shopId}`,
        DISABLE: (photoId: string) => `admin/shop-photos/${photoId}/disable`,
        DELETE: (photoId: string) => `admin/shop-photos/${photoId}`,
    },
    ADMIN_SHOP_DETAILS: {
        GET_ALL: 'admin/shop-details',
        GET_BY_ID: (detailId: string) => `admin/shop-details/${detailId}`,
        DELETE: (detailId: string) => `admin/shop-details/${detailId}`,
    },
}