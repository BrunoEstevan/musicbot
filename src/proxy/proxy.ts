
type ProxyType = {
    proxyUrl: string;
}

export const proxyMain : ProxyType = {
    proxyUrl : process.env.PROXY_URL as string
}
