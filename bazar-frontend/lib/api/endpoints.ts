//List of api routes
//single source of truth for api endpoints 

export const API = {
    AUTH:{
        LOGIN: 'api/auth/login',
        REGISTER: 'api/auth/register',
        WHOAMI: 'api/auth/whoami',
        UPDATEPROFILE:'/api/auth/update-profile',
        UPDATE_BY_ID: (id: string) => `api/auth/${id}`,
    },
    ROLES: {
        GET_ALL: 'api/roles',
    },
    ADMIN: {
        USERS: 'api/admin/users',
        USER: (id: string) => `api/admin/users/${id}`,
    }
}