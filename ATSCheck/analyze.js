export default async function handler(req, res) {
    // Sadece POST (Veri Gönderme) isteklerini kabul et
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt } = req.body;

    // Vercel üzerinden güvenli bir şekilde gizli anahtarımızı çağırıyoruz
    // Bu sayede tarayıcıda (HTML'de) asla görünmüyor.
    const apiKey = process.env.GEMINI_API_KEY; 
    
    if (!apiKey) {
        return res.status(500).json({ error: 'API Key sunucuda bulunamadı.' });
    }

    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(geminiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { response_mime_type: "application/json" }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Yapay zeka sunucusu yanıt vermedi.');
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error("Sunucu Hatası:", error);
        return res.status(500).json({ error: error.message });
    }
}