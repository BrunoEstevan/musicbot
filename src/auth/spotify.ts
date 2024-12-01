
type  SpotifyCredentialsTypes = {
    clientId: string;
    clientSecret: string;
}


export const spotifyCredentials : SpotifyCredentialsTypes = {
     clientId : process.env.SPOTIFY_CLIENT_ID as string,
     clientSecret : process.env.SPOTIFY_CLIENT_SECRET as string
}
     