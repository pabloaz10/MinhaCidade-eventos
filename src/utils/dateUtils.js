import { format, isValid, parse, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Funções utilitárias para manipulação de datas no formato padronizado
 */

/**
 * Converte uma data para um objeto Date seguro
 * @param {Date|string} date - Data a ser convertida
 * @returns {Date|null} Data convertida ou null se inválida
 */
export const toDate = (date) => {
    if (!date) return null;

    // Se já for um objeto Date válido
    if (date instanceof Date && isValid(date)) {
        return date;
    }

    // Se for string ISO
    if (typeof date === 'string') {
        try {
            // Tenta com parseISO para formato ISO
            const parsed = parseISO(date);
            if (isValid(parsed)) return parsed;

            // Tenta com diversos formatos comuns
            const formats = ['yyyy-MM-dd', 'dd/MM/yyyy', 'yyyy-MM-dd HH:mm:ss'];
            for (const fmt of formats) {
                const parsed = parse(date, fmt, new Date());
                if (isValid(parsed)) return parsed;
            }
        } catch (e) {
            console.error('Erro ao converter data:', e);
        }
    }

    return null;
};

/**
 * Cria uma chave de data YYYY-MM-DD para indexação/comparação
 * @param {Date|string} date - Data para gerar a chave
 * @returns {string|null} String no formato YYYY-MM-DD ou null se inválida
 */
export const getDateKey = (date) => {
    const dateObj = toDate(date);
    if (!dateObj) return null;

    // Usa formato direto sem toISOString para evitar problemas de fuso horário
    return format(dateObj, 'yyyy-MM-dd');
};

/**
 * Verifica se duas datas representam o mesmo dia
 * @param {Date|string} date1 - Primeira data
 * @param {Date|string} date2 - Segunda data
 * @returns {boolean} true se forem o mesmo dia
 */
export const isSameDay = (date1, date2) => {
    const d1 = toDate(date1);
    const d2 = toDate(date2);
    if (!d1 || !d2) return false;

    return getDateKey(d1) === getDateKey(d2);
};

// Função para formatar o mês com 3 letras
export const formatMonthShort = (date) => {
    return new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(date).substring(0, 3);
};

/**
 * Formata uma data para exibição
 * @param {Date|string} date - Data para formatar
 * @param {string} formatStr - String de formato (date-fns)
 * @returns {string} Data formatada
 */
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
    const dateObj = toDate(date);
    if (!dateObj) return 'Data inválida';

    return format(dateObj, formatStr, { locale: ptBR });
};

/**
 * Formata uma data para exibição em formato longo
 * @param {Date|string} date - Data para formatar
 * @returns {string} Data em formato longo: "15 de abril de 2025"
 */
export const formatLongDate = (date) => {
    return formatDate(date, "dd 'de' MMMM 'de' yyyy");
};

/**
 * Formata uma data e hora para exibição
 * @param {Date|string} date - Data para formatar
 * @returns {string} Data e hora formatada: "15/04/2025 14:30"
 
export const formatDateTime = (date) => {
    return formatDate(date, 'dd/MM/yyyy HH:mm');
};
*/
/**
 * Extrai apenas a parte de hora de uma data
 * @param {Date|string} date - Data para extrair a hora
 * @returns {string} Hora formatada: "14:30"
 */
export const formatTime = (date) => {
    return formatDate(date, 'HH:mm');
};

/**
 * Obtém data e hora separadas para um evento
 * @param {Date|string} date - Data do evento
 * @returns {Object} Objeto com data e hora formatadas
 */
export const getEventDateTime = (date) => {
    const dateObj = toDate(date);
    if (!dateObj) {
        return { data: 'Data não disponível', hora: '' };
    }

    return {
        data: formatDate(dateObj, 'dd/MM/yyyy'),
        hora: formatTime(dateObj)
    };
};

/**
 * Formata o dia da semana
 * @param {Date|string} date - Data para extrair o dia da semana
 * @param {boolean} short - Se true, retorna abreviado (SEG, TER...)
 * @returns {string} Dia da semana formatado
 */
export const formatWeekday = (date) => {
    return new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date).substring(0, 3);
};

/**
 * Verifica se um horário específico está acontecendo agora
 * @param {string} horarioEvento - Horário do evento no formato "HH:mm"
 * @param {string|Date} dataEvento - Data do evento (obrigatória)
 * @param {number} duracaoMinutos - Duração do evento em minutos (padrão: 60)
 * @returns {boolean} True se o evento estiver acontecendo agora
 */
export const isEventoHappeningNow = (horarioEvento, dataEvento, duracaoMinutos = 60) => {
    // Verifica se a data foi fornecida
    if (!dataEvento) return false;

    const horario = extrairHorasMinutos(horarioEvento);
    if (!horario) return false;

    const now = new Date();

    // Converte a data do evento para um objeto Date
    const eventDate = toDate(dataEvento);
    if (!eventDate) return false;

    // Se a data do evento não for hoje, o evento não está acontecendo agora
    if (!isSameDay(eventDate, now)) return false;

    // Cria o objeto data para o início do evento (com a data correta)
    const eventoInicio = new Date(eventDate);
    eventoInicio.setHours(horario.hora, horario.minuto, 0);

    // Cria o objeto data para o fim do evento
    const eventoFim = new Date(eventoInicio);
    eventoFim.setMinutes(eventoInicio.getMinutes() + duracaoMinutos);

    // Evento está acontecendo se horário atual está entre início e fim
    return now >= eventoInicio && now <= eventoFim;
};

/**
 * Verifica se um evento já passou, considerando data e hora
 * @param {string} horarioEvento - Horário do evento no formato "HH:mm" 
 * @param {string|Date} dataEvento - Data do evento (opcional, usa hoje como padrão)
 * @returns {boolean} True se o evento já passou
 */
export const isEventoPassed = (horarioEvento, dataEvento = null) => {
    const horario = extrairHorasMinutos(horarioEvento);
    if (!horario) return false;

    const now = new Date();

    // Data do evento - usa a data fornecida ou hoje se não fornecida
    const eventDate = dataEvento ? toDate(dataEvento) : new Date();

    if (!eventDate) return false;

    // Se a data do evento é futura, o evento não passou
    if (eventDate.setHours(0, 0, 0, 0) > now.setHours(0, 0, 0, 0)) {
        return false;
    }

    // Se a data do evento é passada, o evento já passou
    if (eventDate.setHours(0, 0, 0, 0) < now.setHours(0, 0, 0, 0)) {
        return true;
    }

    // Se é o mesmo dia, verificamos o horário
    const eventoTime = new Date();
    eventoTime.setHours(horario.hora, horario.minuto, 0);

    // Reseta o now porque usamos setHours acima que modificou o objeto
    now.setHours(new Date().getHours(), new Date().getMinutes(), new Date().getSeconds());

    // Evento já passou se o horário atual é posterior ao do evento
    return now > eventoTime;
};

/**
 * Extrai horas e minutos de um formato de horário
 * @param {string} horarioString - String de horário (HH:mm, HHhMM, etc.)
 * @returns {Object|null} - Objeto com horas e minutos ou null se inválido
 */
export const extrairHorasMinutos = (horarioString) => {
    if (!horarioString) return null;

    let hora, minuto;

    if (horarioString.includes(':')) {
        // Formato "HH:mm"
        [hora, minuto] = horarioString.split(':').map(Number);
    } else if (horarioString.includes('h')) {
        // Formato "HHhMM"
        const parts = horarioString.split('h');
        hora = parseInt(parts[0], 10);
        minuto = parseInt(parts[1] || '0', 10);
    } else {
        // Tenta processar como "HHhMM" sem o 'h'
        try {
            hora = parseInt(horarioString.substring(0, 2), 10);
            minuto = parseInt(horarioString.substring(2), 10) || 0;
        } catch (e) {
            return null;
        }
    }

    if (isNaN(hora) || isNaN(minuto)) return null;

    return { hora, minuto };
};

/**
 * Converte uma data e hora local para formato ISO em UTC
 * Útil para enviar dados para API que requer UTC-0
 * @param {string} data - Data no formato YYYY-MM-DD 
 * @param {string} hora - Hora no formato HH:MM (opcional)
 * @returns {string} Data e hora em formato ISO UTC (YYYY-MM-DDTHH:MM:SS.sssZ)
 */
export const toUTCISOString = (data, hora = '00:00') => {
    if (!data) return null;

    try {
        // Criar data no fuso local
        const [year, month, day] = data.split('-').map(Number);
        const [hours, minutes] = hora ? hora.split(':').map(Number) : [0, 0];

        // Cria um objeto Date com os componentes especificados
        // O Date constructor cria a data no fuso local, mas com os valores exatos especificados
        const localDate = new Date(year, month - 1, day, hours, minutes);

        // Converte para ISO String (que é sempre em UTC)
        return localDate.toISOString();
    } catch (error) {
        console.error('Erro ao converter para UTC ISO:', error);
        return null;
    }
};

/**
 * Formata dados do formulário para envio à API em UTC
 * @param {Object} formData - Dados do formulário com campos data e hora
 * @returns {string} Data ISO em UTC
 */
export const formatarDataHoraParaAPI = (data, hora = null) => {
    // Se não tem data, retorna null
    if (!data) return null;

    // Se não tem hora, assume meia-noite
    const horaFormatada = hora || '00:00';

    // Converte para UTC
    return toUTCISOString(data, horaFormatada);
};