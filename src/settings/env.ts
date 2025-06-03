import { z } from "zod";

const envSchema = z.object({
    BOT_TOKEN: z.string({ description: "Discord Bot Token is required" }).min(1),
    WEBHOOK_LOGS_URL: z.string().url().optional(),
    // Env vars...
    GOOGLE_CSE_ID: z.string({ description: "Gemini Search is required" }).min(1),
    GEMINI_API_KEY: z.string({ description: "Gemini API Key is required" }).min(1),
    GOOGLE_API_KEY: z.string({ description: "Google API Key is required" }).min(1),
});

type EnvSchema = z.infer<typeof envSchema>;

export { envSchema, type EnvSchema };