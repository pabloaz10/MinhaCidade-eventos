import axios from 'axios';

const API_URL = import.meta.env.VITE_APP_API_URL;

export const captchaApi = {
    /**
     * Busca um novo desafio CAPTCHA
     */
    async getChallenge() {
        try {
            const response = await axios.get(`${API_URL}/altcha/challenge`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar desafio CAPTCHA:', error);
            throw new Error(error.response?.data?.message || 'Erro ao carregar CAPTCHA');
        }
    },

    /**
     * Verifica a solução do CAPTCHA
     */
    async verifySolution(payload) {
        try {
            const response = await axios.post(`${API_URL}/altcha/verify`, {
                payload
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao verificar CAPTCHA:', error);
            throw new Error(error.response?.data?.message || 'Erro na verificação');
        }
    },

    /**
     * Verifica token de CAPTCHA
     */
    async verifyToken(token) {
        try {
            const response = await axios.post(`${API_URL}/altcha/verify-token`, {
                token
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao verificar token:', error);
            throw new Error(error.response?.data?.message || 'Token inválido');
        }
    }
};