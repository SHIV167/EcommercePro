import express, { Request, Response } from 'express';
import { sendMail } from '../utils/mailer';

const router = express.Router();

// Endpoint to share QR code via email
router.post('/share', async (req: Request, res: Response) => {
  try {
    const { email, qrCodeUrl } = req.body;

    if (!email || !qrCodeUrl) {
      return res.status(400).json({ message: 'Email and QR code URL are required' });
    }

    // Send email with QR code
    const htmlContent = `
      <p>Here is your QR code:</p>
      <img src="${qrCodeUrl}" alt="QR Code" />
      <p>Scan this code to access the product details.</p>
    `;

    await sendMail({
      to: email,
      subject: 'Your QR Code',
      html: htmlContent
    });

    return res.status(200).json({ message: 'QR code shared successfully via email' });
  } catch (error: unknown) {
    console.error('Error sharing QR code:', error);
    return res.status(500).json({ message: 'Failed to share QR code via email', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
