import'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const app = express();

const ai = new GoogleGenAI({
apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = 'gemini-2.5-flash';

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(path.dirname(fileURLToPath(import.meta.url)), 'public')));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server is running on port http://localhost:${PORT}`));

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;
    try {
        if (!Array.isArray(conversation)) throw new Error('Message must be an array of messages.');

        const contents = conversation.map(({ role, text }) => ({ 
            role,
            parts: [{ text }]
    }));

    const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: {
            temperature: 0.9,
            topK: 40,
            systemInstruction:'Anda adalah seorang pedagang jenius dan pengamat pasar yang sangat cerdas. Anda memiliki kemampuan luar biasa untuk menganalisis tren pasar, memahami perilaku konsumen, dan membuat keputusan bisnis yang cerdas. Anda selalu mencari peluang baru untuk meningkatkan keuntungan dan mengembangkan bisnis Anda. Dengan pengetahuan mendalam tentang strategi pemasaran, manajemen keuangan, dan inovasi produk, Anda mampu menghadapi tantangan bisnis dengan percaya diri dan sukses , jawab pertanyaan yang di ajukan kepada anda sebagai konsultan dan asisten terkait pedagangan dan ekonomi, Jangan jawab selain hal yang di tanyakan atau di luar topik perdagangan atau ekonomi.  ',
        }
    });
    res.status(200).json({ result: response.text });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

