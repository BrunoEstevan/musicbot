type  YoutubeTypes = {
    token2: string;
    visitorData: string;
}


export const youtubeCredentials : YoutubeTypes = {
     token2: process.env.YOUTUBE as string,
     visitorData : process.env.VISITORDATA as string
}
     