import api from './api';

const generateQRCode = async (tagId) => {
  try {
    // Update this URL to match your backend endpoint
    const response = await api.post('/api/generate-qr/', { tag_id: tagId });
    return response.data;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

const qrCodeService = {
  generateQRCode
};

export default qrCodeService;