import React, { useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { useCaptcha } from '../hook/useCaptcha';

const CaptchaComp = forwardRef(({ onVerified, onError }, ref) => {
    const {
        challenge,
        isLoading,
        isVerified,
        error,
        progress,
        verificationToken,
        fetchChallenge,
        solveCaptcha,
        resetCaptcha
    } = useCaptcha({ onVerified, onError });

    const initialized = useRef(false);

    useImperativeHandle(ref, () => ({
        get verified() {
            return isVerified;
        },
        get token() {
            return verificationToken;
        },
        resetCaptcha
    }), [isVerified, verificationToken, resetCaptcha]);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            fetchChallenge();
        }
    }, []);

    // Estilos CSS inline para animações personalizadas
    const styles = `
        @keyframes circlePulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes fadeInSlide {
            from { opacity: 0; transform: translateX(10px); }
            to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideDownSmooth {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes checkmarkDraw {
            0% { stroke-dashoffset: 20; }
            100% { stroke-dashoffset: 0; }
        }
        
        .circle-pulse {
            animation: circlePulse 1.5s ease-in-out infinite;
        }
        
        .fade-in-slide {
            animation: fadeInSlide 0.5s ease-out forwards;
        }
        
        .slide-down-smooth {
            animation: slideDownSmooth 0.3s ease-out forwards;
        }
        
        .checkmark-draw {
            animation: checkmarkDraw 0.6s ease-out forwards;
        }
        
        /* Cores customizadas da paleta */
        .bg-teal-custom {
            background: linear-gradient(135deg, #157A8C, #1FA8C7);
        }
        
        .bg-purple-custom {
            background: linear-gradient(135deg, #3B1E4B, #5B3B7A);
        }
        
        .text-teal-custom {
            color: #157A8C;
        }
        
        .border-teal-custom {
            border-color: #157A8C;
        }
        
        /* Estilos para melhor acessibilidade (mais suaves) */
        .btn-accessible {
            min-height: 40px;
            min-width: 40px;
            touch-action: manipulation;
        }
        
        .checkbox-accessible {
            min-height: 40px;
            min-width: 40px;
            touch-action: manipulation;
        }
    `;

    return (
        <>
            <style>{styles}</style>
            <div className="captcha-container bg-white border border-gray-200 rounded-lg shadow-sm p-6 max-w-sm mx-auto transition-all duration-300 hover:shadow-md" style={{ backgroundColor: '#F7FAFC' }}>
                {/* Header com logo gCAPTCHA */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        {/* Ícone principal SEMPRE igual - tamanho levemente aumentado */}
                        <div className="relative w-9 h-9">
                            <div className="w-9 h-9 bg-teal-custom rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        
                        <span className="text-lg font-bold" style={{ color: '#157A8C' }}>gCAPTCHA</span>
                    </div>
                    
                    {/* Status à direita */}
                    {isVerified && (
                        <div className="flex items-center space-x-1 fade-in-slide">
                            <span className="text-teal-custom text-sm font-medium">Verificado</span>
                        </div>
                    )}
                    
                    {isLoading && progress && (
                        <div className="text-sm opacity-75 animate-pulse font-medium" style={{ color: '#666666' }}>
                            {progress.percentage}%
                        </div>
                    )}
                </div>
                
                {/* Error Display */}
                {error && (
                    <div className="border text-red-700 p-4 rounded-lg mb-4 text-sm slide-down-smooth" style={{ backgroundColor: '#F7FAFC', borderColor: '#E2FBFF' }}>
                        <div className="flex justify-between items-start">
                            <div className="flex items-start space-x-2">
                                <svg className="w-4 h-4 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span>{error}</span>
                            </div>
                            <button 
                                onClick={fetchChallenge}
                                className="bg-purple-custom text-white px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 btn-accessible"
                                style={{ background: 'linear-gradient(135deg, #3B1E4B, #5B3B7A)' }}
                            >
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Main Content Area */}
                <div className="flex items-center justify-between py-4">
                    {/* Checkbox/Verification Icon com progresso circular verde - tamanho moderado */}
                    {challenge && !error && (
                        <div className="flex items-center space-x-4">
                            <div 
                                onClick={!isLoading && !isVerified ? solveCaptcha : undefined}
                                className={`relative w-10 h-10 rounded-full cursor-pointer transition-all duration-500 checkbox-accessible ${
                                    isVerified 
                                        ? "scale-110 shadow-lg" 
                                        : isLoading
                                            ? "cursor-not-allowed"
                                            : "hover:scale-105 active:scale-95 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
                                }`}
                                style={{
                                    backgroundColor: isVerified 
                                        ? '#22c55e' 
                                        : isLoading 
                                            ? '#F7FAFC' 
                                            : '#F7FAFC',
                                    border: isVerified 
                                        ? '2px solid #22c55e' 
                                        : isLoading 
                                            ? '2px solid #E2FBFF' 
                                            : '2px solid #157A8C'
                                }}
                                tabIndex={!isLoading && !isVerified ? 0 : -1}
                                role="button"
                                aria-label={isLoading ? 'Verificando...' : isVerified ? 'Verificado com sucesso' : 'Clique para verificar que não é um robô'}
                                onKeyDown={(e) => {
                                    if ((e.key === 'Enter' || e.key === ' ') && !isLoading && !isVerified) {
                                        e.preventDefault();
                                        solveCaptcha();
                                    }
                                }}
                            >
                                {/* Loading animation - Progresso circular com stroke mais largo */}
                                {isLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                            {/* Círculo de fundo */}
                                            <circle
                                                cx="18"
                                                cy="18"
                                                r="16"
                                                fill="none"
                                                stroke="#E2FBFF"
                                                strokeWidth="3"
                                            />
                                            {/* Círculo de progresso - mais largo */}
                                            <circle
                                                cx="18"
                                                cy="18"
                                                r="16"
                                                fill="none"
                                                stroke="#22c55e"
                                                strokeWidth="4"
                                                strokeLinecap="round"
                                                strokeDasharray="100.5"
                                                strokeDashoffset={100.5 - (100.5 * (progress?.percentage || 0) / 100)}
                                                style={{
                                                    transition: 'stroke-dashoffset 0.3s ease-out'
                                                }}
                                            />
                                        </svg>
                                        {/* Ícone central durante loading */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <svg className="w-4 h-4" style={{ color: '#157A8C' }} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                                
                                {/* V de aprovação verde com animação */}
                                {isVerified && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {/* Fundo verde pulsante */}
                                        <div className="absolute inset-0 rounded-full animate-pulse" style={{ backgroundColor: '#22c55e' }}></div>
                                        
                                        {/* V animado */}
                                        <div className="relative z-10">
                                            <svg 
                                                className="w-5 h-5" 
                                                viewBox="0 0 24 24" 
                                                fill="none" 
                                                stroke="white" 
                                                strokeWidth="3" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round"
                                            >
                                                <path 
                                                    d="M20 6L9 17l-5-5" 
                                                    className="checkmark-draw"
                                                    style={{
                                                        strokeDasharray: '20',
                                                        strokeDashoffset: '20'
                                                    }}
                                                />
                                            </svg>
                                        </div>
                                        
                                        {/* Partículas verdes ao redor do V */}
                                        <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full animate-bounce opacity-75" style={{ backgroundColor: '#22c55e', animationDelay: '0.1s' }}></div>
                                        <div className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full animate-bounce opacity-75" style={{ backgroundColor: '#16a34a', animationDelay: '0.3s' }}></div>
                                        <div className="absolute -bottom-1 -left-1 w-1 h-1 rounded-full animate-bounce opacity-75" style={{ backgroundColor: '#15803d', animationDelay: '0.5s' }}></div>
                                        <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 rounded-full animate-bounce opacity-75" style={{ backgroundColor: '#22c55e', animationDelay: '0.7s' }}></div>
                                    </div>
                                )}
                                
                                {/* Ícone padrão quando não verificado */}
                                {!isLoading && !isVerified && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <svg className="w-4 h-4" style={{ color: '#666666' }} fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            
                            {/* Text */}
                            <span className={`font-medium transition-colors duration-300 ${
                                isVerified ? "text-teal-custom" : ""
                            }`} style={{ color: isVerified ? '#157A8C' : '#666666' }}>
                                {isLoading ? 'Verificando...' : isVerified ? 'Verificado!' : 'Não sou um robô'}
                            </span>
                        </div>
                    )}
                </div>
                
                {/* Footer com cores da paleta */}
                <div className="mt-4 pt-3 border-t" style={{ borderColor: '#E2FBFF' }}>
                    <div className="flex items-center justify-center space-x-1 text-xs" style={{ color: '#666666' }}>
                        <span>Protegido por</span>
                        <span className="font-medium" style={{ color: '#157A8C' }}>gCAPTCHA</span>
                        <svg className="w-3 h-3 ml-1" style={{ color: '#666666' }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>
        </>
    );
});

CaptchaComp.displayName = 'CaptchaComp';

export default CaptchaComp;
