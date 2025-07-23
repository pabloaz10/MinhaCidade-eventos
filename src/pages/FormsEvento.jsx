import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Tela from "../components/Tela";
import MiddlewareEventos from "../middleware/MiddlewareEventos";
import InputField from "../components/forms/InputField";
import TextareaField from "../components/forms/TextareaField";
import SelectField from "../components/forms/SelectField";
import apiService from "../api/apiService";
import Header from "../components/Header";
import CaptchaComp from "../components/CaptchaComp";
import { formatarDataHoraParaAPI } from "../utils/dateUtils";
import ImageUpload from "../components/forms/ImageUploud";

const FormsEvento = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        titulo: "",
        descricao_texto: "",
        data: "",
        hora: "",
        link: "",
        categoriaId: "",
        local: "",
        email: "",
        fonte: "",
        iframe: "",
        imagem: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [captchaVerificado, setCaptchaVerificado] = useState(false);
    const [enviandoFormulario, setEnviandoFormulario] = useState(false);
    const captchaRef = useRef(null);

    // Carregar categorias diretamente do apiService com melhor tratamento de erros
    const carregarCategorias = useCallback(async () => {
        try {
            setLoading(true);
            const categoriasData = await MiddlewareEventos.obterTodasCategorias();

            // Verificar se a resposta é válida
            if (!categoriasData || !Array.isArray(categoriasData)) {
                console.error("Resposta de categorias inválida:", categoriasData);
                setCategorias([]);
                setError("Erro ao carregar categorias: formato de resposta inválido");
                return;
            }

            if (categoriasData.length === 0) {
                console.warn("Nenhuma categoria encontrada");
            }

            setCategorias(categoriasData);
        } catch (error) {
            console.error("Erro ao carregar categorias:", error);
            setError(`Erro ao carregar categorias: ${error.message}`);
            setCategorias([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        carregarCategorias();
    }, [carregarCategorias]);

    // Gerar opções de categoria baseadas nos dados da API
    const opcoesCategoria = useMemo(() => {
        // Array base para as opções do select
        const opcoes = [{ value: "", label: "Selecione uma categoria" }];

        // Verifica se as categorias foram carregadas com sucesso
        if (!categorias || !Array.isArray(categorias) || categorias.length === 0) {
            if (!loading) {
                console.warn("Nenhuma categoria disponível para exibição");
            }
            return opcoes;
        }


        // Função para extrair o ID seguro
        const getIdSeguro = (categoria) => {
            if (!categoria) return "";
            return String(categoria.id || categoria);
        };

        // Função para obter o nome seguro
        const getNomeSeguro = (categoria) => {
            if (!categoria) return "";
            return categoria.nome || String(categoria);
        };

        // Adicionar todas as categorias em ordem alfabética
        categorias
            .slice() // Cria uma cópia para não modificar o array original
            .sort((a, b) => {
                const nomeA = getNomeSeguro(a).toLowerCase();
                const nomeB = getNomeSeguro(b).toLowerCase();
                return nomeA.localeCompare(nomeB);
            })
            .forEach(categoria => {
                opcoes.push({
                    value: getIdSeguro(categoria),
                    label: getNomeSeguro(categoria)
                });
            });

        return opcoes;
    }, [categorias, loading]);  // Removida dependência de categoriasPorTipo pois não é mais usada

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleImageUpload = (imageUrl) => {
        setFormData(prev => ({
            ...prev,
            imagem: imageUrl
        }));
    };

    const handleCaptchaSuccess = useCallback((token) => {
        setCaptchaVerificado(true);
    }, []);

    const handleCaptchaError = useCallback(() => {
        setCaptchaVerificado(false);
    }, []);

    // Modificar o handleSubmit para usar a nova função
    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviandoFormulario(true);
        setError("");

        try {
            // Verificações básicas de UI para campos obrigatórios
            const camposFaltantes = [];
            if (!formData.titulo || formData.titulo.trim() === '') camposFaltantes.push('Título');
            if (!formData.descricao_texto || formData.descricao_texto.trim() === '') camposFaltantes.push('Descrição');
            if (!formData.data || formData.data.trim() === '') camposFaltantes.push('Data');
            if (!formData.link || formData.link.trim() === '') camposFaltantes.push('Link');
            if (!formData.categoriaId || formData.categoriaId.trim() === '') camposFaltantes.push('Categoria');
            if (!formData.local || formData.local.trim() === '') camposFaltantes.push('Local');

            if (camposFaltantes.length > 0) {
                const mensagemErro = `Por favor, preencha os seguintes campos obrigatórios: ${camposFaltantes.join(', ')}`;
                setError(mensagemErro);
                setEnviandoFormulario(false);
                return;
            }

            if (!captchaRef.current || !captchaRef.current.verified) {
                setError("Por favor, complete a verificação do CAPTCHA antes de enviar.");
                setEnviandoFormulario(false);
                return;
            }

            const captchaToken = captchaRef.current.token;
            if (!captchaToken) {
                setError("CAPTCHA inválido ou expirado. Por favor, resolva o CAPTCHA novamente.");
                setEnviandoFormulario(false);
                return;
            }

            // Usar a nova função para formatar a data em UTC
            const dataHoraUTC = formatarDataHoraParaAPI(formData.data, formData.hora);

            const novoEvento = {
                titulo: formData.titulo,
                descricao_texto: formData.descricao_texto,
                data: dataHoraUTC, // Data já em formato UTC
                link: formData.link || "",
                local: formData.local,
                email: formData.email || "",
                fonte: formData.fonte || "",
                iframe: formData.iframe || "",
                categoriaId: parseInt(formData.categoriaId),
                empresaId: 14,
                imagem: formData.imagem
            };

            const validacao = MiddlewareEventos.validarEvento(novoEvento);
            if (!validacao.sucesso) {
                setError(validacao.mensagem);
                setEnviandoFormulario(false);
                return;
            }

            const eventoSalvo = await apiService.criarEvento(novoEvento, captchaToken);
            await MiddlewareEventos.limparCache();

            setSuccess(true);
            setTimeout(() => {
                navigate("/");
            }, 1000);

        } catch (error) {
            console.error("Erro ao enviar evento para API:", error);
            setError(error.message || "Falha ao salvar o evento no banco de dados. Tente novamente mais tarde.");
        } finally {
            setEnviandoFormulario(false);
        }
    };

    return (
        <Tela>
            <Header />
            <div className="container mx-auto px-4 py-8 mt-10">
                <h1 className="text-2xl font-bold text-center text-[#260d33]">Adicionar Novo Evento</h1>

                {loading && (
                    <div className="text-center py-4">
                        <p>Carregando categorias...</p>
                    </div>
                )}

                {success ? (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        Evento adicionado com sucesso! Redirecionando...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {error}
                            </div>
                        )}

                        <InputField
                            label="Título do Evento"
                            name="titulo"
                            value={formData.titulo}
                            onChange={handleChange}
                            placeholder="Ex: Feira de Artesanato"
                            required
                        />

                        <TextareaField
                            label="Descrição"
                            name="descricao_texto"
                            value={formData.descricao_texto}
                            onChange={handleChange}
                            placeholder="Descreva o evento com detalhes..."
                            rows={4}
                            required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Data"
                                name="data"
                                type="date"
                                value={formData.data}
                                onChange={handleChange}
                                required
                            />

                            <InputField
                                label="Hora"
                                name="hora"
                                type="time"
                                value={formData.hora}
                                onChange={handleChange}
                            />
                            <InputField
                                label="Link do Evento"
                                name="link"
                                type="url"
                                value={formData.link}
                                onChange={handleChange}
                                required
                                tooltip="Dica: pode usar link de site oficial, Instagram, Facebook, compra de ingresso."
                            />
                        </div>

                        <SelectField
                            label="Categoria"
                            name="categoriaId"
                            value={formData.categoriaId}
                            onChange={handleChange}
                            options={loading ? [{ value: "", label: "Carregando categorias..." }] : opcoesCategoria}
                            required
                            disabled={loading}
                        />

                        {formData.categoriaId && (
                            <div className="mt-1 mb-4 text-sm text-gray-600">
                                {formData.categoriaId.descricao}
                            </div>
                        )}
                        <div>
                            <label>Imagem do evento:</label>
                            <ImageUpload
                                onUploadSuccess={handleImageUpload}
                                onError={(error) => console.error('Erro no upload:', error)}
                            />
                        </div>
                        <InputField
                            label="Local"
                            name="local"
                            value={formData.local}
                            onChange={handleChange}
                            placeholder="Ex: Praça Central"
                            required
                        />
                        <InputField
                            label="Fonte"
                            name="fonte"
                            value={formData.fonte}
                            type="fonte"
                            onChange={handleChange}
                            placeholder="Ex: Prefeitura de Cianorte"
                            tooltip=""
                            required
                        />
                        <InputField
                            label="Email (opcional)"
                            name="email"
                            value={formData.email}
                            type="email"
                            onChange={handleChange}
                            placeholder="Ex: fulano@email.com"
                            tooltip="Info: Seu email para receber aviso quando o evento for aprovado."
                        />
                        <CaptchaComp
                            ref={captchaRef}
                            onVerified={handleCaptchaSuccess}
                            onError={handleCaptchaError}
                        />

                        <div className="flex justify-end mt-6 space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate("/")}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={!captchaVerificado || enviandoFormulario}
                                className={`px-4 py-2 rounded font-medium transition-colors ${captchaVerificado && !enviandoFormulario
                                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                            >
                                {enviandoFormulario ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Enviando...
                                    </>
                                ) : captchaVerificado ? (
                                    "Enviar Evento"
                                ) : (
                                    "Complete o CAPTCHA primeiro"
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </Tela>
    );
};

export default FormsEvento;