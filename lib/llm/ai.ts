import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

if (!process.env.GOOGLE_GENAI_API_KEY) {
  throw new Error('GOOGLE_GENAI_API_KEY is not defined!');
}

export const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
});
