import React, { useState, useRef, useCallback } from 'react';
import uploadImageToImgBB from '../../api/apiUploudImage';

/**
 * Componente para upload de imagens com drag and drop
 * @param {Function} onUploadSuccess - Callback que recebe a URL da imagem após upload bem-sucedido
 * @param {string} initialImage - URL da imagem inicial (opcional)
 * @param {Function} onError - Callback opcional para tratamento de erro
 */
const ImageUpload = ({ onUploadSuccess, initialImage = null, onError }) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(initialImage);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [imageUrl, setImageUrl] = useState(initialImage); // Armazena a URL final da imagem
  const fileInputRef = useRef(null);

  // Tratamento de eventos de drag
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  }, []);

  // Tratamento do evento de drop
  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setErrorMsg('');

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await processFile(file);
    }
  }, []);

  // Tratamento de seleção pelo input file
  const handleChange = useCallback(async (e) => {
    setErrorMsg('');
    if (e.target.files?.[0]) {
      await processFile(e.target.files[0]);
    }
  }, []);

  // Validação e processamento da imagem
  const processFile = async (file) => {
    // Validação de tipo
    if (!file.type.startsWith('image/')) {
      const error = 'Por favor, selecione uma imagem válida!';
      setErrorMsg(error);
      if (onError) onError(error);
      return;
    }

    // Validação de tamanho (5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB em bytes
    if (file.size > MAX_SIZE) {
      const error = 'A imagem é muito grande (máximo: 5MB)';
      setErrorMsg(error);
      if (onError) onError(error);
      return;
    }

    // Pré-visualização da imagem
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);

    // Upload da imagem
    await uploadFile(file);
  };

  // Fazer o upload para o serviço
  const uploadFile = async (file) => {
    setUploading(true);
    try {
      const url = await uploadImageToImgBB(file);
      setUploading(false);

      // Armazena a URL e chama o callback
      setImageUrl(url);

      if (onUploadSuccess) {
        onUploadSuccess(url);
      }
    } catch (error) {
      const errorMessage = `Erro no upload: ${error.message}`;
      setErrorMsg(errorMessage);
      if (onError) onError(errorMessage);
      setUploading(false);
    }
  };

  // Função para abrir o seletor de arquivos
  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handler de clique no contêiner principal
  const handleContainerClick = () => {
    if (!uploading) {
      openFilePicker();
    }
  };

  return (
    <div className="relative">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${errorMsg ? 'border-red-400' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleContainerClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleChange}
          className="hidden"
          accept="image/*"
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p>Enviando imagem...</p>
          </div>
        ) : previewUrl ? (
          <div className="flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-40 max-w-full mb-2 rounded-md object-contain"
              onClick={handleContainerClick}
            />
            <p className="text-sm text-gray-500">Clique ou arraste para substituir</p>

            {/* Mostrar a URL gerada para facilitar a depuração */}
            {imageUrl && (
              <div className="mt-2 text-xs text-gray-500 break-all">
                <strong>URL gerada:</strong> {imageUrl}
              </div>
            )}
          </div>
        ) : (
          <div onClick={(e) => e.stopPropagation()}>
            <p className="text-gray-600 mb-2">
              <span className="text-blue-500 font-medium">Arraste e solte</span> sua imagem aqui
            </p>
            <p className="text-gray-500 text-sm">ou</p>
            <button
              type="button"
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                openFilePicker();
              }}
            >
              Selecione um arquivo
            </button>
            <p className="text-gray-400 text-xs mt-2">Formatos: JPG, PNG, GIF (Max: 5MB)</p>
          </div>
        )}
      </div>

      {errorMsg && (
        <p className="text-red-500 text-sm mt-2">{errorMsg}</p>
      )}
    </div>
  );
};

export default ImageUpload;