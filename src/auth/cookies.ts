type CookiesTypes = {
    cookie: string;
}

// Para usar cookies do navegador (formato string simples)
export const cookies : CookiesTypes = {
    cookie: process.env.COOKIE as string
}