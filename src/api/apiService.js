// apiService.js - Novo arquivo para chamadas de API
import axios from 'axios';

const API_URL = import.meta.env.VITE_APP_API_URL;

// Cria uma instância do axios com a URL base e tempo limite de 15 segundos
const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
});

// Adiciona interceptador para logs e tratamento de erros
api.interceptors.response.use(
    response => response,
    error => {
        // Log detalhado do erro
        if (error.response) {
            console.error('Erro na resposta da API:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers,
                url: error.config?.url
            });
        } else if (error.request) {
            console.error('Sem resposta da API:', error.request);
        } else {
            console.error('Erro de configuração da API:', error.message);
        }
        return Promise.reject(error);
    }
);

// Cache para respostas recentes
const responseCache = {
    eventos: null,
    categorias: null,
    eventosCategoria: {},
    eventosData: {},
    cacheTimeout: 2 * 60 * 1000, // 2 minutos
    lastFetch: {
        eventos: 0,
        categorias: 0,
    }
};

// Verifica se o cache está expirado
const isCacheExpired = (key) => {
    return Date.now() - responseCache.lastFetch[key] > responseCache.cacheTimeout;
};

const apiService = {
    /**
     * Busca todos os eventos
     * @returns {Promise<Array>} Lista de eventos
     */
    async getEventos() {
        // Usar cache se disponível e válido
        if (responseCache.eventos && !isCacheExpired('eventos')) {
            return responseCache.eventos;
        }

        try {
            const response = await api.get('/eventos');

            // Atualizar cache
            responseCache.eventos = response.data;
            responseCache.lastFetch.eventos = Date.now();

            return response.data;
        } catch (error) {
            console.error('Erro ao buscar eventos:', error.message);
            throw error;
        }
    },

    /**
     * Busca um evento específico por ID
     * @param {number} id ID do evento
     * @returns {Promise<Object>} Dados do evento
     */
    async getEventoPorId(id) {
        // Verificar se já temos o evento no cache
        if (responseCache.eventos) {
            const eventoCache = responseCache.eventos.find(e => e.id === id);
            if (eventoCache) {
                return eventoCache;
            }
        }

        try {
            const response = await api.get(`/eventos/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar evento ${id}:`, error.message);
            throw error;
        }
    },

    /**
     * Busca todas as categorias
     * @returns {Promise<Array>} Lista de categorias
     */
    async getCategorias() {
        // Usar cache se disponível e válido
        if (responseCache.categorias && !isCacheExpired('categorias')) {
            return responseCache.categorias;
        }

        try {
            const response = await api.get('/categorias');

            // Atualizar cache
            responseCache.categorias = response.data;
            responseCache.lastFetch.categorias = Date.now();

            return response.data;
        } catch (error) {
            console.error('Erro ao buscar categorias:', error.message);
            throw error;
        }
    },

    /**
     * Busca eventos de uma categoria específica
     * @param {number|string} categoriaId ID ou nome da categoria
     * @returns {Promise<Array>} Lista de eventos da categoria
     */
    async getEventosPorCategoria(categoriaId) {
        const cacheKey = `cat_${categoriaId}`;

        // Usar cache se disponível
        if (responseCache.eventosCategoria[cacheKey]) {
            return responseCache.eventosCategoria[cacheKey];
        }

        const id = typeof categoriaId === 'object' ? categoriaId.id : categoriaId;

        try {
            const response = await api.get(`/eventos?categoria=${id}`);

            // Verificar se a API já está filtrando corretamente
            // Se não estiver, aplicamos um filtro local
            const eventos = response.data;

            // Aplicar filtro local caso a API não esteja filtrando corretamente
            const eventosFiltrados = eventos.filter(evento => {
                // Se o evento.categoria for objeto, verificar pelo ID
                if (evento.categoria && typeof evento.categoria === 'object') {
                    return evento.categoria.id === id;
                }
                // Se for uma string ou valor direto, comparar diretamente
                return evento.categoria === id;
            });

            // Armazenar no cache
            responseCache.eventosCategoria[cacheKey] = eventosFiltrados;

            return eventosFiltrados;
        } catch (error) {
            console.error(`Erro ao buscar eventos da categoria ${categoriaId}:`, error.message);
            throw error;
        }
    },

    /**
     * Busca eventos de uma data específica
     * @param {string} data Data no formato YYYY-MM-DD
     * @returns {Promise<Array>} Lista de eventos na data
     */
    async getEventosPorData(data) {
        const cacheKey = `data_${data}`;

        // Usar cache se disponível
        if (responseCache.eventosData[cacheKey]) {
            return responseCache.eventosData[cacheKey];
        }

        try {
            const response = await api.get(`/eventos?data=${data}`);

            // Armazenar no cache
            responseCache.eventosData[cacheKey] = response.data;

            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar eventos na data ${data}:`, error.message);
            throw error;
        }
    },

    /**
     * Busca todas as empresas
     * @returns {Promise<Array>} Lista de empresas
     */
    async getEmpresas() {
        try {
            const response = await api.get('/empresas');
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar empresas:', error.message);
            throw error;
        }
    },

    /**
     * Busca eventos de uma empresa específica
     * @param {number} empresaId ID da empresa
     * @returns {Promise<Array>} Lista de eventos da empresa
     */
    async getEventosPorEmpresa(empresaId) {
        try {
            const response = await api.get(`/eventos?empresa=${empresaId}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar eventos da empresa ${empresaId}:`, error.message);
            throw error;
        }
    },

    /**
     * Limpa o cache de respostas
     */
    limparCache() {
        responseCache.eventos = null;
        responseCache.categorias = null;
        responseCache.eventosCategoria = {};
        responseCache.eventosData = {};
        responseCache.lastFetch = {
            eventos: 0,
            categorias: 0,
        };
    },

    /**
     * Cria um novo evento no banco de dados
     * @param {Object} eventoData - Dados do novo evento
     * @param {string} captchaToken - Token do reCAPTCHA para validação
     * @returns {Promise<Object>} - Evento criado
     */
    async criarEvento(eventoData, captchaToken) {
        try {
            if (!captchaToken) {
                throw new Error('Token CAPTCHA é necessário para criar um evento');
            }
            // Prepara os dados do evento para enviar à API
            const eventoFormatado = {
                titulo: eventoData.titulo,
                descricao_texto: eventoData.descricao_texto || '',
                descricao_provas: eventoData.descricao_provas || '',
                data: eventoData.data,
                imagem: eventoData.imagem, // Verifica se esse campo está sendo preenchido corretamente
                link: eventoData.link || '',
                fonte: eventoData.fonte || '',
                local: eventoData.local || '',
                iframe: eventoData.iframe || '',
                categoriaId: parseInt(eventoData.categoriaId) || null,
                empresaId: eventoData.empresaId || 14,
                status: 'inativo',
                captchaToken
            };

            const response = await api.post('/eventos', eventoFormatado);

            // Se a requisição foi bem-sucedida, atualize o cache
            if (response.data) {
                if (responseCache.eventos) {
                    responseCache.eventos.push(response.data);
                }
            }

            return response.data;
        } catch (error) {
            console.error('Erro ao criar evento:', error);

            if (error.response) {
                // Erro com resposta do servidor (4xx ou 5xx)
                const errorMessage = error.response.data?.error ||
                    error.response.data?.message ||
                    (error.response.data?.errors && error.response.data.errors.length > 0
                        ? error.response.data.errors[0].msg
                        : 'Falha ao criar evento');
                throw new Error(`Erro ${error.response.status}: ${errorMessage}`);
            } else if (error.request) {
                // Erro sem resposta (problemas de rede)
                throw new Error('Sem resposta do servidor. Verifique sua conexão.');
            } else {
                // Erro de configuração da requisição
                throw error;
            }
        }
    }
};

export default apiService;