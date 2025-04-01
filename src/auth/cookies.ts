type CookiesTypes = {
    cookie: string;
}


export const cookies : CookiesTypes = {
        cookie : process.env.COOKIE as string
    }