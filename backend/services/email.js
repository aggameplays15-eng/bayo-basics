import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

const FROM = process.env.EMAIL_FROM || `Bayo Basics <${process.env.GMAIL_USER}>`;

// Base HTML template
const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { margin: 0; padding: 0; background: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.07); }
    .header { background: #111827; padding: 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.6); margin: 6px 0 0; font-size: 13px; }
    .body { padding: 40px 32px; }
    .body h2 { font-size: 22px; font-weight: 800; color: #111827; margin: 0 0 8px; }
    .body p { color: #6B7280; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
    .badge { display: inline-block; background: #F3F4F6; color: #111827; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 24px; }
    .card { background: #F8FAFC; border-radius: 16px; padding: 20px 24px; margin: 20px 0; }
    .card-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E5E7EB; font-size: 14px; }
    .card-row:last-child { border-bottom: none; font-weight: 800; font-size: 16px; color: #111827; }
    .card-row span:first-child { color: #6B7280; }
    .btn { display: block; width: fit-content; margin: 24px auto 0; background: #111827; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-weight: 700; font-size: 15px; }
    .status { display: inline-block; padding: 6px 16px; border-radius: 999px; font-weight: 700; font-size: 12px; text-transform: uppercase; }
    .status-pending { background: #FEF3C7; color: #92400E; }
    .status-delivered { background: #D1FAE5; color: #065F46; }
    .status-cancelled { background: #FEE2E2; color: #991B1B; }
    .footer { background: #F8FAFC; padding: 24px 32px; text-align: center; border-top: 1px solid #E5E7EB; }
    .footer p { color: #9CA3AF; font-size: 12px; margin: 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>BAYO</h1>
      <p>Le style Premium accessible.</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Bayo Basics · Conakry, Guinée</p>
      <p style="margin-top:4px">Paiement à la livraison · Qualité garantie</p>
    </div>
  </div>
</body>
</html>
`;

// ─── Email senders ────────────────────────────────────────────────────────────

// 1. Confirmation d'inscription
export const sendWelcomeEmail = async ({ name, email }) => {
    await transporter.sendMail({
        from: FROM,
        to: email,
        subject: '🎉 Bienvenue chez Bayo Basics !',
        html: baseTemplate(`
            <span class="badge">Nouveau compte</span>
            <h2>Bienvenue, ${name} !</h2>
            <p>Votre compte Bayo Basics a été créé avec succès. Vous pouvez maintenant commander vos articles préférés avec paiement à la livraison.</p>
            <a href="${process.env.FRONTEND_URL || 'https://bayo-basics.vercel.app'}/products" class="btn">Découvrir la boutique</a>
        `)
    });
};

// 2. Confirmation de commande (client)
export const sendOrderConfirmationEmail = async ({ name, email, order, items }) => {
    const itemsHtml = items.map(item => `
        <div class="card-row">
            <span>${item.name} × ${item.quantity}</span>
            <span>${(item.price * item.quantity).toLocaleString('fr-FR')} GNF</span>
        </div>
    `).join('');

    await transporter.sendMail({
        from: FROM,
        to: email,
        subject: `✅ Commande #${order.id} confirmée — Bayo Basics`,
        html: baseTemplate(`
            <span class="badge">Commande confirmée</span>
            <h2>Merci pour votre commande, ${name} !</h2>
            <p>Votre commande a bien été reçue. Un conseiller vous contactera pour confirmer la livraison.</p>
            <div class="card">
                ${itemsHtml}
                <div class="card-row">
                    <span>Livraison (${order.city})</span>
                    <span>${order.deliveryFee.toLocaleString('fr-FR')} GNF</span>
                </div>
                <div class="card-row">
                    <span>Total à payer</span>
                    <span>${order.total.toLocaleString('fr-FR')} GNF</span>
                </div>
            </div>
            <p style="margin-top:16px">📍 Adresse de livraison : <strong>${order.address}, ${order.city}</strong></p>
            <p>💵 Paiement en espèces à la livraison.</p>
        `)
    });
};

// 3. Notification admin nouvelle commande
export const sendAdminNewOrderEmail = async ({ order, items }) => {
    const itemsHtml = items.map(item => `
        <div class="card-row">
            <span>${item.name} × ${item.quantity}</span>
            <span>${(item.price * item.quantity).toLocaleString('fr-FR')} GNF</span>
        </div>
    `).join('');

    await transporter.sendMail({
        from: FROM,
        to: process.env.GMAIL_USER,
        subject: `🛒 Nouvelle commande #${order.id} — ${order.total.toLocaleString('fr-FR')} GNF`,
        html: baseTemplate(`
            <span class="badge">Nouvelle commande</span>
            <h2>Commande #${order.id}</h2>
            <div class="card">
                <div class="card-row"><span>Client</span><span>${order.customerName}</span></div>
                <div class="card-row"><span>Téléphone</span><span>${order.customerPhone}</span></div>
                <div class="card-row"><span>Email</span><span>${order.customerEmail}</span></div>
                <div class="card-row"><span>Adresse</span><span>${order.address}, ${order.city}</span></div>
            </div>
            <div class="card">
                ${itemsHtml}
                <div class="card-row"><span>Livraison</span><span>${order.deliveryFee.toLocaleString('fr-FR')} GNF</span></div>
                <div class="card-row"><span>Total</span><span>${order.total.toLocaleString('fr-FR')} GNF</span></div>
            </div>
            <a href="${process.env.FRONTEND_URL || 'https://bayo-basics.vercel.app'}/mb04" class="btn">Gérer la commande</a>
        `)
    });
};

// 4. Mise à jour statut commande (client)
export const sendOrderStatusEmail = async ({ name, email, order }) => {
    const statusMap = {
        'Livré':     { label: 'Livré',     cls: 'status-delivered', msg: 'Votre commande a été livrée avec succès. Merci pour votre confiance !' },
        'Annulé':    { label: 'Annulé',    cls: 'status-cancelled', msg: 'Votre commande a été annulée. Contactez-nous pour plus d\'informations.' },
        'En attente':{ label: 'En attente',cls: 'status-pending',   msg: 'Votre commande est en cours de traitement.' }
    };
    const s = statusMap[order.status] || statusMap['En attente'];

    await transporter.sendMail({
        from: FROM,
        to: email,
        subject: `📦 Commande #${order.id} — Statut : ${s.label}`,
        html: baseTemplate(`
            <span class="badge">Mise à jour commande</span>
            <h2>Bonjour ${name},</h2>
            <p>Le statut de votre commande <strong>#${order.id}</strong> a été mis à jour :</p>
            <p><span class="status ${s.cls}">${s.label}</span></p>
            <p>${s.msg}</p>
            <div class="card">
                <div class="card-row"><span>Total payé</span><span>${order.total.toLocaleString('fr-FR')} GNF</span></div>
                <div class="card-row"><span>Ville</span><span>${order.city}</span></div>
            </div>
        `)
    });
};

// 5. Réinitialisation mot de passe
export const sendPasswordResetEmail = async ({ name, email, resetToken }) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'https://bayo-basics.vercel.app'}/reset-password?token=${resetToken}`;
    await transporter.sendMail({
        from: FROM,
        to: email,
        subject: '🔐 Réinitialisation de votre mot de passe — Bayo Basics',
        html: baseTemplate(`
            <span class="badge">Sécurité</span>
            <h2>Réinitialiser votre mot de passe</h2>
            <p>Bonjour ${name}, vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous. Ce lien expire dans <strong>1 heure</strong>.</p>
            <a href="${resetUrl}" class="btn">Réinitialiser le mot de passe</a>
            <p style="margin-top:24px;font-size:13px">Si vous n'avez pas fait cette demande, ignorez cet email.</p>
        `)
    });
};
