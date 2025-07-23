/**
 * Utilitários para CAPTCHA ALTCHA
 */

/**
 * Calcula hash SHA-256 de uma string
 */
export async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Resolve o desafio ALTCHA
 */
export async function solveChallenge(challengeData, onProgress = null) {
    const { challenge: challengeHash, salt, maxNumber } = challengeData;
    const maxNum = maxNumber || 50000;


    for (let number = 0; number <= maxNum; number++) {
        const hash = await sha256(salt + number);

        if (hash === challengeHash) {
            return number;
        }

        // Callback de progresso
        if (onProgress && number % 5000 === 0 && number > 0) {
            onProgress({
                current: number,
                total: maxNum,
                percentage: ((number / maxNum) * 100).toFixed(1)
            });
        }

        // Permitir respiro do browser
        if (number % 100 === 0) {
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }

    throw new Error('Solução não encontrada');
}

/**
 * Cria payload para verificação
 */
export function createVerificationPayload(challengeData, solution) {
    const payload = {
        algorithm: challengeData.algorithm,
        challenge: challengeData.challenge,
        number: solution,
        salt: challengeData.salt,
        signature: challengeData.signature
    };

    return btoa(JSON.stringify(payload));
}

/**
 * Valida dados do desafio
 */
export function validateChallengeData(data) {
    const requiredFields = ['challenge', 'salt', 'signature'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
        throw new Error(`Dados do desafio incompletos: ${missingFields.join(', ')}`);
    }

    return true;
}

/**
 * Formata tempo em segundos para display
 */
export function formatTime(seconds) {
    if (seconds < 60) {
        return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Funções utilitárias para gerenciamento de estado do CAPTCHA
 */

/**
 * Inicializa o estado do CAPTCHA
 */
export function initializeCaptchaState() {
    return {
        challenge: null,
        isLoading: false,
        isVerified: false,
        error: null,
        progress: null,
        verificationToken: null
    };
}

/**
 * Gerencia a busca de um novo desafio CAPTCHA
 */
export async function handleFetchChallenge(captchaApi, setState) {
    setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        isVerified: false,
        progress: null,
        verificationToken: null
    }));

    try {
        const data = await captchaApi.getChallenge();
        validateChallengeData(data);

        if (!data.maxnumber) {
            data.maxnumber = 50000;
        }

        setState(prev => ({ ...prev, challenge: data }));
        return { success: true, data };
    } catch (err) {
        const errorMsg = err.message || 'Erro ao carregar CAPTCHA';
        setState(prev => ({ ...prev, error: errorMsg }));
        return { success: false, error: errorMsg };
    } finally {
        setState(prev => ({ ...prev, isLoading: false }));
    }
}

/**
 * Gerencia a resolução do CAPTCHA
 */
export async function handleSolveCaptcha(challenge, setState) {
    if (!challenge) {
        const errorMsg = 'Nenhum desafio disponível';
        setState(prev => ({ ...prev, error: errorMsg }));
        return { success: false, error: errorMsg };
    }

    setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        progress: null
    }));

    try {

        // Resolver desafio matematicamente
        const solution = await solveChallenge(challenge, (progressData) => {
            setState(prev => ({ ...prev, progress: progressData }));
        });


        // Criar payload/token local
        const payload = createVerificationPayload(challenge, solution);

        // Marcar como verificado localmente
        setState(prev => ({
            ...prev,
            isVerified: true,
            error: null,
            verificationToken: payload
        }));

        return { success: true, token: payload };

    } catch (err) {
        console.error('❌ Erro ao resolver CAPTCHA:', err);
        const errorMsg = err.message || 'Erro ao resolver CAPTCHA';
        setState(prev => ({
            ...prev,
            error: errorMsg,
            isVerified: false,
            verificationToken: null
        }));
        return { success: false, error: errorMsg };
    } finally {
        setState(prev => ({
            ...prev,
            isLoading: false,
            progress: null
        }));
    }
}

/**
 * Gerencia o reset do CAPTCHA
 */
export async function handleResetCaptcha(captchaApi, setState) {
    setState(prev => ({
        ...prev,
        isVerified: false,
        error: null,
        progress: null,
        challenge: null,
        verificationToken: null
    }));

    return await handleFetchChallenge(captchaApi, setState);
}

/**
 * Valida se o CAPTCHA está pronto para envio
 */
export function validateCaptchaForSubmission(captchaState) {
    if (!captchaState.isVerified || !captchaState.verificationToken) {
        return {
            valid: false,
            error: "Por favor, complete a verificação CAPTCHA antes de enviar."
        };
    }

    return { valid: true };
}

/**
 * Gerencia callbacks de sucesso e erro do CAPTCHA
 */
export function handleCaptchaCallbacks(result, onVerified, onError) {
    if (result.success && result.token) {
        onVerified?.(result.token);
    } else if (!result.success && result.error) {
        onError?.(result.error);
    }
}