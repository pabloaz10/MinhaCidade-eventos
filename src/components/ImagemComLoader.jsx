import React, { useState, useEffect } from "react";
import { FiImage } from "react-icons/fi";

const ImagemComLoader = ({ src, alt, className, imageClassName, loaderClassName, aspectRatio = "16/9" }) => {
    const [imageStatus, setImageStatus] = useState("loading"); // "loading", "loaded", "error"

    useEffect(() => {
        if (!src) {
            setImageStatus("error");
            return;
        }

        // Reset estado quando src mudar
        setImageStatus("loading");

        // Função para pré-carregar a imagem
        const preloadImage = async () => {
            try {
                await loadImage(src);
                setImageStatus("loaded");
            } catch (error) {
                console.error("Erro ao carregar imagem:", error);
                setImageStatus("error");
            }
        };

        preloadImage();
    }, [src]);

    // Função que retorna uma Promise para carregar a imagem
    const loadImage = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Falha ao carregar imagem: ${src}`));
            img.src = src;
        });
    };

    // Estilo do container que mantém a proporção da imagem
    const aspectRatioStyle = {
        position: 'relative',
        width: '100%',
        paddingBottom: aspectRatio.includes('/')
            ? `calc(100% * ${aspectRatio.split('/')[1]} / ${aspectRatio.split('/')[0]})`
            : aspectRatio.includes(':')
                ? `calc(100% * ${aspectRatio.split(':')[1]} / ${aspectRatio.split(':')[0]})`
                : aspectRatio
    };

    return (
        <div className={`${className}`}>
            <div style={aspectRatioStyle} className="overflow-hidden rounded-lg">
                {/* Estado de carregamento da imagem */}
                {imageStatus === "loading" && (
                    <div className={`absolute inset-0  animate-pulse flex items-center justify-center ${loaderClassName}`}>
                        <FiImage size={40} className="text-gray-400" />
                    </div>
                )}

                {/* Fallback para imagem com erro */}
                {imageStatus === "error" && (
                    <div className={`absolute inset-0 bg-gray-100 flex items-center justify-center ${loaderClassName}`}>
                        <div className="text-center p-4">
                            <FiImage size={30} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Imagem não disponível</p>
                        </div>
                    </div>
                )}

                {/* Imagem real (só exibida quando totalmente carregada) */}
                {imageStatus === "loaded" && (
                    <img
                        className={`absolute inset-0 w-full h-full object-cover ${imageClassName}`}
                        src={src}
                        alt={alt}
                    />
                )}
            </div>
        </div>
    );
};

export default ImagemComLoader;