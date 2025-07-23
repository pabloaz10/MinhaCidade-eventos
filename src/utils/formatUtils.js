/**
 * Utilitários para formatação de texto
 */

/**
 * Formata o nome de uma categoria para exibição adequada
 * Lida com diferentes formatos de entrada (string, objeto, null)
 * 
 * @param {string|Object} categoria - Nome da categoria ou objeto categoria a ser formatado
 * @returns {string} Categoria formatada em Title Case
 */
export const formatarNomeCategoria = (categoria) => {
    // Se a categoria for nula ou indefinida
    if (categoria == null) return "";

    // Se categoria for um objeto (formato da API), pegamos a propriedade nome
    if (typeof categoria === 'object' && categoria.nome) {
        return formatarNomeCategoria(categoria.nome);
    }

    // Se não for uma string, convertemos para string
    const catString = String(categoria);

    // Verifica se a string contém um hífen
    if (catString.includes('-')) {
        // Tratamento de kebab-case
        return catString
            .split('-')
            .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
            .join(' ');
    } else {
        // Tratamento para palavras simples ou com espaços
        return catString
            .split(' ')
            .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
            .join(' ');
    }
};

/**
 * Trunca um texto até um determinado tamanho e adiciona reticências
 * 
 * @param {string} texto - Texto a ser truncado
 * @param {number} tamanhoMaximo - Tamanho máximo desejado
 * @returns {string} Texto truncado
 */
export const truncarTexto = (texto, tamanhoMaximo = 100) => {
    if (!texto) return "";

    // Remove tags HTML se existirem
    const textoLimpo = texto.replace(/<[^>]*>/g, '');

    if (textoLimpo.length <= tamanhoMaximo) return textoLimpo;

    return textoLimpo.substring(0, tamanhoMaximo) + '...';
};

/**
 * Formata o texto preservando as quebras de linha para exibição em HTML
 * 
 * @param {string} texto - Texto com quebras de linha para formatar
 * @returns {string} HTML com quebras de linha convertidas para <br>
 */
export const formatarTextoComQuebras = (texto) => {
    if (!texto) return "";

    // Primeiro substituir caracteres de escape \n que vêm da API
    let textoNormalizado = texto
        .replace(/\\n/g, '\n')     // Substitui \n (caractere de escape) por quebra de linha real
        .replace(/\r\n/g, '\n')    // Normaliza quebras de linha Windows
        .replace(/\r/g, '\n');     // Normaliza quebras de linha Mac

    // Depois substitui \n por <br> para HTML
    return textoNormalizado.replace(/\n/g, '<br>');
};

/**
 * Preserva quebras de linha para uso em componentes React
 * Retorna um array que pode ser usado em JSX com map
 * 
 * @param {string} texto - Texto com quebras de linha
 * @returns {Array} Array de strings com quebras de linha identificadas
 */
export const preservarQuebrasReact = (texto) => {
    if (!texto) return [];

    // Normalizar caracteres de escape primeiro
    let textoNormalizado = texto
        .replace(/\\n/g, '\n')     // Substitui \n (caractere de escape) por quebra de linha real
        .replace(/\r\n/g, '\n')    // Normaliza quebras de linha Windows
        .replace(/\r/g, '\n');     // Normaliza quebras de linha Mac

    // Retorna array de linhas que o componente consumidor pode renderizar com map
    return textoNormalizado.split('\n');
};