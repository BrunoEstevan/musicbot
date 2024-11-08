# Awesome Bot Base

> [!NOTE] 
> This project **base** can be generated using the [Constant CLI](https://github.com/rinckodev/constatic)
> See the full documentation for this base by accessing: https://constatic-docs.vercel.app/docs/discord/start

This is the most complete discord bot base you've ever seen! Developed by [@rinckodev](https://github.com/rinckodev), this project uses typescript in an incredible way to provide complete structures and facilitate the development of your discord bot.

> [!WARNING]
> [NodeJs](https://nodejs.org/en) version required: 20.12 or higher

## Scripts

- `dev`: running bot in development
- `build`: build the project
- `watch`: running in watch mode
- `start`: running the compiled bot

## Structures

- [Commands](https://constatic-docs.vercel.app/docs/discord/commands)
- [Responder](https://constatic-docs.vercel.app/docs/discord/responders)
- [Events](https://constatic-docs.vercel.app/docs/discord/events)


## Install ffmpeg

This package is required for the bot to run

npm i ffmpeg

## Config .env
DISCORD_TOKEN = "YOUR_DISCORD_TOKEN"  
APP_ID = "YOUR_APP_ID"  
PUBLIC_KEY = "YOUR_PUBLIC_KEY"  
YTB_OAUTH = "YOUR_YTB_OAUTH"



DISCORD_TOKEN and APP_ID
DISCORD_TOKEN (Client Secret) and APP_ID (Application ID) can be found in the OAuth2 section of your application in the Discord Developer Portal.

PUBLIC_KEY
PUBLIC_KEY (Public Key) is not required for the bot to function, but it can be found in the General Information section of your application in the Discord Developer Portal.

YTB_OAUTH
To obtain this authentication key, follow these steps:

## Run the following command in your project’s terminal:


npx --no discord-player-youtubei
If you encounter issues with the above npx command, try using a normal npm install:


npm install discord-player-youtubei
After running this command, you will receive a message in the console similar to the one below. Follow the link and enter the code provided in the indicated space on the Google page!

Follow this URL: https://www.google.com/device and enter this code: AAA-AAA-AAA
After completing these steps, a long string will appear in the console. Don't worry, it’s simply your YOUR_YTB_OAUTH. Copy the entire string, from access_token to expiry_date, and paste it into the designated space in your .env file.
