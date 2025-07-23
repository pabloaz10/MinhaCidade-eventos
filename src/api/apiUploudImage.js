import axios from 'axios';

/**
 * Faz upload de uma imagem para o serviço ImgBB
 * @param {File} imageFile - Arquivo de imagem para upload
 * @returns {Promise<string>} - URL da imagem após upload
 */
const uploadImageToImgBB = async (imageFile) => {
  // Obter API key do ambiente (mais seguro)
  const API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${API_KEY}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    if (response.data.success) {
      // Retornamos a URL de exibição que é geralmente a mais adequada para uso
      const imageUrl = response.data.data.display_url;

      return imageUrl;
    } else {
      throw new Error('Upload falhou: ' + response.data.status);
    }
  } catch (error) {
    console.error('Erro no upload de imagem:', error);
    throw error;
  }
};

export default uploadImageToImgBB;