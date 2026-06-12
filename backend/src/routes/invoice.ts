import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendInvoiceEmail } from '../services/emailService';

const router = Router();
const prisma = new PrismaClient();

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { client: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Create new invoice
router.post('/', async (req, res) => {
  const { client, items, dueDate, status, notes } = req.body;
  const { name, address, email, phone } = client;
  
  try {
    // Basic logic: Find or create client
    let dbClient = await prisma.client.findFirst({ where: { name } });
    if (!dbClient) {
      dbClient = await prisma.client.create({
        data: { name, address, email: email || null, phone: phone || null }
      });
    } else {
      // Mettre à jour les infos si elles ont changé
      dbClient = await prisma.client.update({
        where: { id: dbClient.id },
        data: { address, email: email || dbClient.email, phone: phone || dbClient.phone }
      });
    }

    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0);
    const taxRate = 18; // TVA 18% (UEMOA)
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    const invoice = await prisma.invoice.create({
      data: {
        number: `FA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        clientId: dbClient.id,
        dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days default
        status: status || 'DRAFT',
        subtotal,
        taxRate,
        taxAmount,
        total,
        notes,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.price,
            amount: item.quantity * item.price
          }))
        }
      },
      include: {
        client: true,
        items: true
      }
    });

    let previewUrl = null;
    if (invoice.status === 'PENDING') {
      // In a real app we would use dbClient.email, but we'll use a dummy for testing Ethereal
      const emailResult = await sendInvoiceEmail(
        dbClient.email || 'client@example.com',
        dbClient.name,
        invoice.number,
        invoice.total
      );
      if (emailResult.success) {
        previewUrl = emailResult.previewUrl;
      }
    }

    res.status(201).json({ ...invoice, previewUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// GET single invoice
router.get('/:id', async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { client: true, items: true }
    });
    if (!invoice) return res.status(404).json({ error: 'Facture non trouvée' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PATCH — changer le statut d'une facture
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  const allowed = ['DRAFT', 'PENDING', 'PAID', 'OVERDUE'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Statut invalide' });
  }
  try {
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: { status },
      include: { client: true, items: true }
    });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Impossible de mettre à jour le statut' });
  }
});

export default router;

