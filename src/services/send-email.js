import { Resend } from 'resend';
import { ContactFormEmail } from '../../emails/ContactForm';
import { render } from '@react-email/render';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, message } = req.body;
    
    const emailHtml = render(ContactFormEmail({ name, email, message }));

    await resend.emails.send({
      from: 'your-email@yourdomain.com',
      to: 'admin@yourdomain.com',
      subject: 'New Contact Form Submission',
      html: emailHtml,
    });

    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Error sending email' });
  }
} 