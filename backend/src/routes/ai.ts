import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';

const router = Router();

// Initialize Gemini client if API key is present
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

router.post('/chat', async (req, res) => {
  const { message } = req.body;
  
  if (!ai) {
    console.warn("[IA] Clé GEMINI_API_KEY manquante. Utilisation du mock.");
    setTimeout(() => {
      res.json({
        reply: "Ceci est une réponse simulée car la clé API Gemini n'est pas configurée. J'ai bien reçu : " + message,
        action: "draft_invoice_ready"
      });
    }, 1500);
    return;
  }

  try {
    console.log(`[IA] Message reçu : ${message}`);
    
    // Call Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{
            text: `Tu es un assistant virtuel intégré à un logiciel de facturation (FacturePME PRO).
            Ton rôle est d'aider l'utilisateur à créer des factures, rédiger des relances, et répondre à ses questions sur la facturation.
            Réponds de manière professionnelle et concise.
            
            Requête de l'utilisateur: ${message}`
          }]
        }
      ]
    });

    res.json({
      reply: response.text || "Je n'ai pas pu générer de réponse.",
      action: "none"
    });

  } catch (error) {
    console.error("Erreur Gemini:", error);
    res.status(500).json({ error: 'Erreur lors de la communication avec l\'IA Gemini' });
  }
});

export default router;
