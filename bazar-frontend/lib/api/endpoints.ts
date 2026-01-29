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
}