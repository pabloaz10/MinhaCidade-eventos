/**
 * Middleware para processamento de eventos
 * Usa dados da API para gerenciar eventos e cache centralizado
 */
import apiService from "../api/apiService";
import { toDate, getDateKey } from "../utils/dateUtils";

class MiddlewareEventos {
    // Cache para evitar múltiplas requisições à API
    static #eventosCache = null;
    static #categoriasCache = null;
    static #eventoDetalhesCache = {};
    static #inicializando = false;
    static #inicializacaoPromise = null;

    // Timestamps para controle de expiração
    static #ultimaAtualizacao = {
        eventos: 0,
        categorias: 0
    };

    // Configurações de cache
    static #configCache = {
        timeoutEventos: 2 * 60 * 1000,    // 2 minutos
        timeoutCategorias: 5 * 60 * 1000, // 5 minutos
        persistirCache: true              // Se deve persistir no localStorage
    };

    /**
     * Verifica se o cache expirou para determinado tipo de dados
     * @param {string} tipo - 'eventos' ou 'categorias'
     * @returns {boolean} - true se expirou, false caso contrário
     */
    static #cacheExpirou(tipo) {
        const agora = Date.now();
        const ultimaAtualizacao = this.#ultimaAtualizacao[tipo] || 0;
        const timeout =
            tipo === 'eventos' ? this.#configCache.timeoutEventos :
                tipo === 'categorias' ? this.#configCache.timeoutCategorias :
                    2 * 60 * 1000; // Default 2 minutos

        return agora - ultimaAtualizacao > timeout;
    }

    /**
     * Salva o estado do cache no localStorage
     */
    static #salvarCacheNoStorage() {
        if (!this.#configCache.persistirCache) return;

        try {
            const cacheParaSalvar = {
                eventos: this.#eventosCache,
                categorias: this.#categoriasCache,
                eventoDetalhes: this.#eventoDetalhesCache,
                ultimaAtualizacao: this.#ultimaAtualizacao,
                timestamp: Date.now()
            };

            localStorage.setItem('minhacidade_cache', JSON.stringify(cacheParaSalvar));
        } catch (error) {
            console.error('Erro ao salvar cache no localStorage:', error);
        }
    }

    /**
     * Carrega o cache do localStorage
     * @returns {boolean} - true se o cache foi carregado com sucesso
     */
    static #carregarCacheDoStorage() {
        try {
            const cacheString = localStorage.getItem('minhacidade_cache');
            if (!cacheString) return false;

            const cache = JSON.parse(cacheString);
            const timestamp = cache.timestamp || 0;

            // Verifica se o cache é muito antigo (mais de 24h)
            if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
                localStorage.removeItem('minhacidade_cache');
                return false;
            }

            // Carrega os dados do cache
            this.#eventosCache = cache.eventos;
            this.#categoriasCache = cache.categorias;
            this.#eventoDetalhesCache = cache.eventoDetalhes || {};
            this.#ultimaAtualizacao = cache.ultimaAtualizacao || {
                eventos: 0,
                categorias: 0
            };

            return true;
        } catch (error) {
            console.error('Erro ao carregar cache do localStorage:', error);
            // Limpa o cache em caso de erro
            localStorage.removeItem('minhacidade_cache');
            return false;
        }
    }

    /**
     * Inicializa o cache de eventos e categorias uma única vez
     * Primeiro tenta carregar do localStorage, depois da API
     * @returns {Promise<boolean>} True se a inicialização foi bem-sucedida
     */
    static async inicializarCache() {
        // Se já estamos inicializando, retorne a Promise existente
        if (this.#inicializando && this.#inicializacaoPromise) {
            return this.#inicializacaoPromise;
        }

        // Se já temos o cache e ele não expirou, não precisamos inicializar novamente
        if (this.#eventosCache !== null && !this.#cacheExpirou('eventos')) {
            return true;
        }

        // Tentar carregar do localStorage primeiro
        const cacheCarregado = this.#carregarCacheDoStorage();
        if (cacheCarregado && this.#eventosCache && !this.#cacheExpirou('eventos')) {
            return true;
        }

        this.#inicializando = true;
        this.#inicializacaoPromise = (async () => {
            try {
                // Obter eventos e categorias em paralelo para melhorar a performance
                const [eventos, categorias] = await Promise.all([
                    apiService.getEventos(),
                    apiService.getCategorias()
                ]);

                // Se a API retornou eventos, use-os
                if (eventos && eventos.length > 0) {
                    this.#eventosCache = eventos;
                    this.#ultimaAtualizacao.eventos = Date.now();

                    // Armazenar categorias no cache também
                    if (categorias && categorias.length > 0) {
                        this.#categoriasCache = categorias;
                        this.#ultimaAtualizacao.categorias = Date.now();
                    }

                    // Salvar no localStorage para uso futuro
                    this.#salvarCacheNoStorage();
                    return true;
                }

                // Se a API não retornou eventos
                console.error('API não retornou eventos');
                this.#eventosCache = [];
                return false;
            } catch (error) {
                // Em caso de erro na API
                console.error('Erro ao buscar dados da API:', error);
                this.#eventosCache = [];
                return false;
            } finally {
                this.#inicializando = false;
                this.#inicializacaoPromise = null;
            }
        })();

        return this.#inicializacaoPromise;
    }

    /**
     * Verifica se existem eventos disponíveis
     * @returns {Promise<boolean} True se existem eventos, false caso contrário
     */
    static async verificarExistenciaEventos() {
        await this.inicializarCache();
        return this.#eventosCache && this.#eventosCache.length > 0;
    }

    /**
     * Obtém todos os eventos disponíveis
     * Recarrega da API se o cache estiver expirado
     * @param {boolean} [somenteAtivos=false] - Se true, retorna apenas eventos ativos
     * @returns {Promise<Array>} Lista de eventos ou array vazio se não existirem
     */
    static async obterTodosEventos(somenteAtivos = false) {
        await this.inicializarCache();

        // Se o cache expirou, busque novos dados da API
        if (this.#cacheExpirou('eventos')) {
            try {
                const eventos = await apiService.getEventos();
                if (eventos && eventos.length > 0) {
                    this.#eventosCache = eventos;
                    this.#ultimaAtualizacao.eventos = Date.now();
                    this.#salvarCacheNoStorage();
                }
            } catch (error) {
                console.error('Erro ao atualizar cache de eventos:', error);
            }
        }

        const eventos = this.#eventosCache || [];

        // Se não precisa filtrar, retorna todos os eventos
        if (!somenteAtivos) return eventos;

        // Filtra apenas eventos ativos usando o método isEventoAtivo
        return eventos.filter(evento => this.isEventoAtivo(evento));
    }

    /**
     * Obtém um evento pelo ID
     * @param {string|number} id ID do evento
     * @returns {Promise<Object|null>} Objeto do evento ou null se não encontrado
     */
    static async obterEventoPorId(id) {
        await this.inicializarCache();

        if (!this.#eventosCache) return null;

        // Primeiro verifica no cache para evitar requisição
        const eventoCache = this.#eventosCache.find(evento => evento.id === id);
        if (eventoCache) return eventoCache;

        // Se não encontrou no cache principal, verifica no cache de detalhes
        if (this.#eventoDetalhesCache[id]) {
            return this.#eventoDetalhesCache[id];
        }

        try {
            const eventoApi = await apiService.getEventoPorId(id);
            if (eventoApi) {
                // Adiciona ao cache de detalhes para futuras consultas
                this.#eventoDetalhesCache[id] = eventoApi;
                this.#salvarCacheNoStorage();
                return eventoApi;
            }
        } catch (error) {
            console.error(`Erro ao buscar evento ${id} da API:`, error);
        }

        // Se não encontrou na API, retorna null
        return null;
    }

    /**
     * Obtém todas as categorias existentes
     * Recarrega da API se o cache estiver expirado
     * @returns {Promise<Array>} Lista de categorias únicas
     */
    static async obterTodasCategorias() {
        await this.inicializarCache();

        // Se já temos categorias em cache e não expirou, use-as
        if (this.#categoriasCache && !this.#cacheExpirou('categorias')) {
            return this.#categoriasCache;
        }

        // Tenta buscar categorias da API
        try {
            const categoriasApi = await apiService.getCategorias();
            if (categoriasApi && categoriasApi.length > 0) {
                this.#categoriasCache = categoriasApi;
                this.#ultimaAtualizacao.categorias = Date.now();
                this.#salvarCacheNoStorage();
                return categoriasApi;
            }
        } catch (error) {
            console.error('Erro ao buscar categorias da API:', error);
        }

        // Se já temos categorias em cache mesmo que expirado, use-as como fallback
        if (this.#categoriasCache) {
            return this.#categoriasCache;
        }

        // Fallback: extrair dos eventos
        if (!this.#eventosCache || this.#eventosCache.length === 0) return [];

        const categorias = [...new Set(this.#eventosCache
            .filter(evento => evento.categoria)
            .map(evento => {
                if (typeof evento.categoria === 'object') {
                    return evento.categoria.nome;
                }
                return evento.categoria;
            }))];

        // Armazena no cache
        this.#categoriasCache = categorias.filter(cat => cat).sort();
        this.#ultimaAtualizacao.categorias = Date.now();
        this.#salvarCacheNoStorage();

        return this.#categoriasCache;
    }

    /**
     * Verifica se um evento está ativo (não marcado como inativo ou excluído)
     * @param {Object} evento - Evento a ser verificado
     * @returns {boolean} - true se o evento estiver ativo
     */
    static isEventoAtivo(evento) {
        // Verificar se o evento existe
        if (!evento) return false;

        // Verificar explicitamente se o status é 'ativo' ou 'cancelado'
        // Considera cancelado como "ativo" para exibição, mas com marcação especial
        if (evento.hasOwnProperty('status')) {
            // Se tem status, deve ser 'ativo' ou 'cancelado' para ser considerado ativo
            if (evento.status !== 'ativo' && evento.status !== 'cancelado') {
                return false;
            }

            return true;
        }

        // Manter as verificações existentes para compatibilidade (para eventos que não têm campo 'status')
        return (!evento.hasOwnProperty('inativo') || evento.inativo === false) &&
            (!evento.hasOwnProperty('excluido') || evento.excluido === false);
    }

    /**
     * Verifica se um evento está cancelado
     * @param {Object} evento - Evento a ser verificado
     * @returns {boolean} - true se o evento estiver cancelado
     */
    static isEventoCancelado(evento) {
        return evento && evento.hasOwnProperty('status') && evento.status === 'cancelado';
    }

    /**
     * Filtra eventos por data e opcionalmente por categoria
     * Retorna apenas eventos ativos (não marcados como inativos ou excluídos)
     * @param {Date|string} data Data para filtrar os eventos
     * @param {Object|string|number|null} categoria Categoria para filtrar (opcional)
     * @returns {Promise<Array>} Lista de eventos filtrados e ativos
     */
    static async filtrarEventos(data, categoria = null) {
        try {
            // Obter todos os eventos ativos diretamente - garantindo que somenteAtivos é true
            const eventos = await this.obterTodosEventos(true);

            // Adicionar log para depuração

            if (eventos.length === 0) return [];

            // Converter data para objeto Date para comparação
            const dataObj = toDate(data);
            if (!dataObj) return [];

            // Gerar chave de data para comparação
            const dataKey = getDateKey(dataObj);

            // Filtrar por data
            let eventosFiltrados = eventos.filter(evento => {
                // Evento precisa ter data válida
                if (!evento.data) return false;

                // Comparar data
                const eventoData = toDate(evento.data);
                return eventoData && getDateKey(eventoData) === dataKey;
            });
            // Se uma categoria específica foi solicitada, filtrar mais
            if (categoria) {
                const idCategoria = typeof categoria === 'object' && categoria.id
                    ? categoria.id
                    : Number(categoria) || String(categoria);

                eventosFiltrados = eventosFiltrados.filter(evento => {
                    // Comparar IDs numéricos ou strings dependendo do caso
                    const eventoIdCategoria = typeof evento.categoriaId === 'object'
                        ? evento.categoriaId.id || evento.categoriaId
                        : evento.categoriaId;

                    return String(eventoIdCategoria) === String(idCategoria);
                });
            }

            return eventosFiltrados;
        } catch (error) {
            console.error("Erro ao filtrar eventos:", error);
            return [];
        }
    }

    /**
     * Adiciona um novo evento através do formulário
     * Este método mantém a assinatura para compatibilidade, mas só gera o texto para WhatsApp
     * @param {Object} evento Objeto contendo os dados do evento
     * @returns {Object} Resultado da operação com mensagem para WhatsApp
     */
    static adicionarEvento(evento) {
        try {

            // Validação básica - Checando categoriaId
            const camposObrigatorios = ['titulo', 'descricao_texto', 'data', 'local', 'link', 'categoriaId'];

            const camposFaltantes = camposObrigatorios.filter(campo => {
                // Verificação mais completa para cada campo
                const valor = evento[campo];
                if (valor === undefined || valor === null) return true;
                if (typeof valor === 'string' && valor.trim() === '') return true;
                // Para categoriaId, que deve ser numérico
                if (campo === 'categoriaId' && isNaN(parseInt(valor))) return true;
                return false;
            });

            if (camposFaltantes.length > 0) {
                console.error("Campos obrigatórios faltantes:", camposFaltantes);
                return {
                    sucesso: false,
                    mensagem: `Todos os campos obrigatórios devem ser preenchidos: ${camposFaltantes.join(', ')}`
                };
            }

            // Verificar se a data é válida
            if (!toDate(evento.data)) {
                return {
                    sucesso: false,
                    mensagem: "A data fornecida é inválida."
                };
            }

            // Apenas retorna sucesso para o formulário, não altera os dados
            return {
                sucesso: true,
                mensagem: "Evento enviado para análise!",
                evento: evento
            };
        } catch (error) {
            console.error("Erro ao processar adição de evento:", error);
            return {
                sucesso: false,
                mensagem: "Ocorreu um erro ao processar a adição do evento."
            };
        }
    }

    /**
     * Valida os dados de um evento antes de enviar para a API
     * @param {Object} evento Objeto contendo os dados do evento
     * @returns {Object} Resultado da validação
     */
    static validarEvento(evento) {
        try {
            // Validação básica - Checando categoriaId
            const camposObrigatorios = ['titulo', 'descricao_texto', 'data', 'local', 'link', 'categoriaId'];

            const camposFaltantes = camposObrigatorios.filter(campo => {
                // Verificação mais completa para cada campo
                const valor = evento[campo];
                if (valor === undefined || valor === null) return true;
                if (typeof valor === 'string' && valor.trim() === '') return true;
                // Para categoriaId, que deve ser numérico
                if (campo === 'categoriaId' && isNaN(parseInt(valor))) return true;
                return false;
            });

            if (camposFaltantes.length > 0) {
                console.error("Campos obrigatórios faltantes:", camposFaltantes);
                return {
                    sucesso: false,
                    mensagem: `Todos os campos obrigatórios devem ser preenchidos: ${camposFaltantes.join(', ')}`
                };
            }

            // Verificar se a data é válida - aceitar formato ISO também
            const data = evento.data;
            const dataValida = toDate(data) ||
                (typeof data === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(data));

            if (!dataValida) {
                return {
                    sucesso: false,
                    mensagem: "A data fornecida é inválida."
                };
            }

            // Validação bem-sucedida
            return {
                sucesso: true,
                mensagem: "Evento validado com sucesso!"
            };
        } catch (error) {
            console.error("Erro ao validar evento:", error);
            return {
                sucesso: false,
                mensagem: "Ocorreu um erro ao validar o evento."
            };
        }
    }

    // Função para registrar visualização do evento
    static registrarVisualizacao(eventoId) {
        try {
            // Obter visualizações existentes do localStorage
            const visualizacoesStr = localStorage.getItem('eventoVisualizacoes');
            const visualizacoes = visualizacoesStr ? JSON.parse(visualizacoesStr) : {};

            // Incrementar contagem para este evento
            visualizacoes[eventoId] = (visualizacoes[eventoId] || 0) + 1;

            // Salvar de volta no localStorage
            localStorage.setItem('eventoVisualizacoes', JSON.stringify(visualizacoes));

            // Opcional: enviar dados para analytics
            if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', 'view_item', {
                    event_category: 'Eventos',
                    event_label: `Evento ${eventoId}`,
                    value: 1
                });
            }

            return true;
        } catch (error) {
            console.error('Erro ao registrar visualização:', error);
            return false;
        }
    }

    // Função para obter estatísticas de visualização
    static obterEstatisticasVisualizacao() {
        try {
            const visualizacoesStr = localStorage.getItem('eventoVisualizacoes');
            return visualizacoesStr ? JSON.parse(visualizacoesStr) : {};
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            return {};
        }
    }

    /**
     * Função para limpar o cache (útil para testes ou forçar recargas)
     * @param {string} [tipoDados] - Opcional: tipo específico de dados para limpar ('eventos', 'categorias')
     */
    static limparCache(tipoDados = null) {
        if (!tipoDados || tipoDados === 'eventos') {
            this.#eventosCache = null;
            this.#ultimaAtualizacao.eventos = 0;
        }

        if (!tipoDados || tipoDados === 'categorias') {
            this.#categoriasCache = null;
            this.#ultimaAtualizacao.categorias = 0;
        }

        if (!tipoDados || tipoDados === 'eventoDetalhes') {
            this.#eventoDetalhesCache = {};
        }

        // Remover do localStorage
        if (this.#configCache.persistirCache) {
            try {
                if (!tipoDados) {
                    localStorage.removeItem('minhacidade_cache');
                } else {
                    // Se for um tipo específico, carrega o cache, limpa a parte relevante e salva de volta
                    this.#salvarCacheNoStorage();
                }
            } catch (error) {
                console.error('Erro ao limpar cache do localStorage:', error);
            }
        }

    }

    /**
     * Configura as opções de cache
     * @param {Object} config - Objeto com as configurações
     * @param {number} [config.timeoutEventos] - Tempo em ms até o cache de eventos expirar
     * @param {number} [config.timeoutCategorias] - Tempo em ms até o cache de categorias expirar
     * @param {boolean} [config.persistirCache] - Se o cache deve ser persistido no localStorage
     */
    static configurarCache(config) {
        this.#configCache = { ...this.#configCache, ...config };
    }
}

export default MiddlewareEventos;