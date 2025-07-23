import React from 'react';

/**
 * Analisa a descrição do evento em busca de arrays de objetos
 * 
 * @param {string|object} descricao - Descrição do evento, pode ser string ou já um objeto com arrays
 * @returns {Array} - Array contendo os arrays encontrados e seus tipos
 */
export const analisarDescricaoEvento = (descricao) => {
    if (!descricao) return [];

    // Se já for um objeto complexo (com arrays aninhados)
    if (typeof descricao === 'object' && !React.isValidElement(descricao)) {
        // Mapear arrays no objeto
        const arrays = [];

        // Verifique se há arrays em propriedades de primeiro nível
        Object.entries(descricao).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
                // Determinar o tipo com base em propriedades da primeira entrada
                const firstItem = value[0];
                let type = 'default';

                if (firstItem.horario && (firstItem.prova || firstItem.categoria)) {
                    type = 'prova';
                } else if (firstItem.nome) {
                    type = 'instituicao';
                } else if (firstItem.titulo || firstItem.title) {
                    type = 'evento';
                }

                arrays.push({
                    type,
                    title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
                    items: value
                });
            }
        });

        return arrays;
    }

    // Tentar interpretar strings JSON na descrição
    try {
        // Buscar por possíveis estruturas JSON em um texto
        const jsonPattern = /\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\}/g;
        const matches = descricao.toString().match(jsonPattern);

        if (matches && matches.length > 0) {
            const arrays = [];

            for (const match of matches) {
                try {
                    const obj = JSON.parse(match);

                    Object.entries(obj).forEach(([key, value]) => {
                        if (Array.isArray(value) && value.length > 0) {
                            let type = 'default';
                            const firstItem = value[0];

                            if (firstItem.horario && (firstItem.prova || firstItem.categoria)) {
                                type = 'prova';
                            } else if (firstItem.nome) {
                                type = 'instituicao';
                            }

                            arrays.push({
                                type,
                                title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
                                items: value
                            });
                        }
                    });
                } catch (e) {
                    console.log('Erro ao analisar JSON na descrição:', e);
                }
            }

            return arrays;
        }
    } catch (e) {
        console.log('Erro na análise de descrição:', e);
    }

    return [];
};