import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET all clients (with their invoices)
router.get('/', async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      include: {
        invoices: {
          select: { id: true, total: true, status: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Impossible de récupérer les clients' });
  }
});

// GET single client
router.get('/:id', async (req, res) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.id },
      include: {
        invoices: {
          include: { items: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!client) return res.status(404).json({ error: 'Client non trouvé' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST create client
router.post('/', async (req, res) => {
  const { name, email, phone, address, siret } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Le nom est obligatoire' });
  try {
    const client = await prisma.client.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        siret: siret?.trim() || null,
      }
    });
    res.status(201).json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Impossible de créer le client' });
  }
});

// PUT update client
router.put('/:id', async (req, res) => {
  const { name, email, phone, address, siret } = req.body;
  try {
    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: {
        name: name?.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        siret: siret?.trim() || null,
      }
    });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Impossible de mettre à jour' });
  }
});

// DELETE client
router.delete('/:id', async (req, res) => {
  try {
    await prisma.client.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Impossible de supprimer' });
  }
});

export default router;
