const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

async function notificarNuevoLead(lead) {
  try {
    await transporter.sendMail({
      from: `"MA Real Estate" <${process.env.GMAIL_USER}>`,
      to: process.env.NOTIFY_EMAIL,
      subject: `Nuevo lead: ${lead.nombre} ${lead.apellido}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fafaf8;">
          <p style="color: #c9a84c; font-size: 11px; letter-spacing: 0.2em;">NUEVO LEAD — MA REAL ESTATE</p>
          <h2 style="font-weight: 400; font-size: 24px; margin-bottom: 24px;">${lead.nombre} ${lead.apellido}</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #e8e8e4; color: #888; font-size: 12px; width: 120px;">EMAIL</td><td style="padding: 10px 0; border-bottom: 1px solid #e8e8e4; font-size: 14px;">${lead.email}</td></tr>
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #e8e8e4; color: #888; font-size: 12px;">TELÉFONO</td><td style="padding: 10px 0; border-bottom: 1px solid #e8e8e4; font-size: 14px;">${lead.telefono || '—'}</td></tr>
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #e8e8e4; color: #888; font-size: 12px;">FORMULARIO</td><td style="padding: 10px 0; border-bottom: 1px solid #e8e8e4; font-size: 14px;">${lead.tipo_formulario}</td></tr>
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #e8e8e4; color: #888; font-size: 12px;">MENSAJE</td><td style="padding: 10px 0; border-bottom: 1px solid #e8e8e4; font-size: 14px;">${lead.mensaje || '—'}</td></tr>
          </table>
          ${lead.telefono ? `<a href="https://wa.me/56${lead.telefono.replace(/\D/g, '').replace(/^56/, '')}?text=Hola%20${encodeURIComponent(lead.nombre)}%2C%20te%20contactamos%20desde%20MA%20Real%20Estate." style="display: inline-block; margin-top: 24px; background: #25D366; color: #fff; padding: 12px 24px; text-decoration: none; font-size: 13px; border-radius: 2px;">Responder por WhatsApp</a>` : ''}
          <p style="margin-top: 32px; font-size: 12px; color: #aaa;">MA Real Estate — contacto@marealestate.cl</p>
        </div>
      `,
    });
    console.log('Email notificacion enviado');
  } catch (error) {
    console.error('Error enviando email:', error.message);
  }
}

module.exports = { notificarNuevoLead };
