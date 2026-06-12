/**
 * Formate un montant en Francs CFA (XOF)
 * Ex: 150000 → "150 000 FCFA"
 */
export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount)) + ' FCFA';
}
