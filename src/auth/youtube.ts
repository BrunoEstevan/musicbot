type  YoutubeTypes = {
    token: string;
    visitorData: string;
}


export const youtubeCredentials : YoutubeTypes = {
     token: process.env.YOUTUBE as string,
     visitorData : process.env.VISITORDATA as string
}
     