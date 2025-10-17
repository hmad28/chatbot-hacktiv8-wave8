import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';

import path from 'node:path'; // sesi 5
import { fileURLToPath } from 'node:url'; // sesi 5

import 'dotenv/config';



// inisialisasi express
const app = express();
const upload = multer();

const ai = new GoogleGenAI({ });

const __filename = fileURLToPath(import.meta.url); // sesi 5
const __dirname = path.dirname(__filename); // sesi 5

app.use(cors());
app.use(express.json())

app.use(
    express.static(
        path.join(__dirname, "static")
    ),
); // sesi 5

app.post('/generate-text', async (req, res) => { 
    const { prompt } = req.body;
    console.log({prompt});

    if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({
            success: false,
            message: 'Prompt harus berupa string!',
            data: null
        });
        return;
    }

    try {
        const aiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { text: prompt }
            ],
            config: {
                systemInstruction: "Harus dijawab dalam bahasa Indonesia.",
            }
        });

        res.status(200).json({
            success: true,
            message: 'Berhasil dijawab!',
            data: aiResponse.text
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server!',
            data: null
        });
    }
});

app.post("/api/chat", async (req, res) => {
    const { conversation } = req.body;

    try {
        if (Array.isArray(conversation)) {
            throw new Error("Conversation harus berupa array!");
        }
    } catch (e) {

    }
})

app.listen(3000, () => {
    console.log('Server berjalan pada http://localhost:3000');
});