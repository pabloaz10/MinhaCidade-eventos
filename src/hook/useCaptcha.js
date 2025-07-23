import { useState, useCallback } from 'react';
import { captchaApi } from '../api/captchaApi';
import { 
    initializeCaptchaState,
    handleFetchChallenge,
    handleSolveCaptcha,
    handleResetCaptcha,
    handleCaptchaCallbacks
} from '../utils/captchaUtils';

export function useCaptcha({ onVerified, onError } = {}) {
    const [captchaState, setCaptchaState] = useState(initializeCaptchaState);

    /**
     * Busca um novo desafio
     */
    const fetchChallenge = useCallback(async () => {
        const result = await handleFetchChallenge(captchaApi, setCaptchaState);
        handleCaptchaCallbacks(result, null, onError);
    }, [onError]);

    /**
     * Resolve o CAPTCHA e gera token local
     */
    const solveCaptcha = useCallback(async () => {
        const result = await handleSolveCaptcha(captchaState.challenge, setCaptchaState);
        handleCaptchaCallbacks(result, onVerified, onError);
    }, [captchaState.challenge, onVerified, onError]);

    /**
     * Reset completo do CAPTCHA
     */
    const resetCaptcha = useCallback(async () => {
        const result = await handleResetCaptcha(captchaApi, setCaptchaState);
        handleCaptchaCallbacks(result, null, onError);
    }, [onError]);

    return {
        // Estados
        challenge: captchaState.challenge,
        isLoading: captchaState.isLoading,
        isVerified: captchaState.isVerified,
        error: captchaState.error,
        progress: captchaState.progress,
        verificationToken: captchaState.verificationToken,
        
        // Ações
        fetchChallenge,
        solveCaptcha,
        resetCaptcha
    };
}