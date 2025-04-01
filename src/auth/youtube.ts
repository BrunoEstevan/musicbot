type  YoutubeTypes = {
    token2: string;
    visitorData: string;
}


export const youtubeCredentials : YoutubeTypes = {
     token2: process.env.YOUTUBE as string,
     visitorData : process.env.VISITORDATA as string
}
     
export const youtubeOauth : { oauthtoken: string } = {
    oauthtoken : process.env.YTB_OAUTH as string
}