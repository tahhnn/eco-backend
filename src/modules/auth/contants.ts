export type JwtPayload = {
    username: string;
    sub: string;
    role: 'admin' | 'user';
};