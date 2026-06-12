import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter;

// Initialize the transporter using Ethereal Email (for testing)
async function initTransporter() {
  if (transporter) return transporter;

  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  return transporter;
}

export const sendInvoiceEmail = async (clientEmail: string, clientName: string, invoiceNumber: string, total: number) => {
  try {
    const mailTransporter = await initTransporter();

    // setup email data
    const info = await mailTransporter.sendMail({
      from: '"FacturePME PRO" <hello@facturepme.com>', // sender address
      to: clientEmail, // list of receivers
      subject: `Votre facture ${invoiceNumber} est prête`, // Subject line
      text: `Bonjour ${clientName},\n\nVeuillez trouver ci-joint la facture ${invoiceNumber} d'un montant total de ${total.toFixed(2)} €.\n\nCordialement,\nL'équipe FacturePME PRO`, // plain text body
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #534AB7;">Bonjour ${clientName},</h2>
          <p>Nous vous remercions pour votre confiance. Vous trouverez ci-dessous les détails de votre facture.</p>
          <div style="background-color: #F8F7F5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Facture N° :</strong> ${invoiceNumber}</p>
            <p><strong>Montant Total TTC :</strong> ${total.toFixed(2)} €</p>
          </div>
          <p>La version PDF de cette facture est disponible sur votre espace client.</p>
          <br/>
          <p>Cordialement,</p>
          <p><strong>L'équipe FacturePME PRO</strong></p>
        </div>
      `, // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    
    return { success: true, messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
};
