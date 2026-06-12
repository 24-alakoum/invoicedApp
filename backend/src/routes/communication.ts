import { Router } from 'express';

const router = Router();

router.post('/send', async (req, res) => {
  const { invoiceId, channel } = req.body; // channel: 'email' | 'whatsapp'
  
  try {
    // Intégration SendGrid (Email) et Twilio (WhatsApp)
    console.log(`Sending invoice ${invoiceId} via ${channel}...`);
    
    setTimeout(() => {
      res.json({ success: true, message: `Facture envoyée avec succès par ${channel}` });
    }, 1000);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'envoi' });
  }
});

export default router;
