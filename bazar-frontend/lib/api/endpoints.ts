//List of api routes
//single source of truth for api endpoints 

export const API = {
    AUTH:{
        LOGIN: 'api/auth/login',
        REGISTER: 'api/auth/register',
        WHOAMI: 'api/auth/whoami',
        UPDATEPROFILE:'/api/auth/update-profile',
    },
    ROLES: {
        GET_ALL: 'api/roles',
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
    }
}