# Minha Cidade - Portal de Eventos 🏙️

![Logo Minha Cidade](./public/minhacidade-logo.svg)

## Sobre o projeto

Minha Cidade é uma aplicação web progressiva (PWA) que centraliza informações sobre eventos locais em uma cidade. O objetivo da plataforma é conectar cidadãos aos eventos culturais, esportivos, sociais e outros acontecimentos relevantes da sua região, facilitando o acesso à informação e incentivando a participação comunitária.

## Funcionalidades principais

- **Calendário interativo**: Visualize eventos organizados por data
- **Categorização**: Encontre eventos filtrados por categorias (esporte, cultura, gastronomia, etc.)
- **Visualização detalhada**: Acesse informações completas sobre cada evento
- **Adição de eventos**: Contribua com a comunidade submetendo novos eventos
- **Integração climática**: Visualize a previsão do tempo para o dia do evento
- **Mapa integrado**: Localize eventos através de mapas incorporados
- **Modo offline**: Acesse informações básicas mesmo sem conexão com internet
- **PWA**: Instalável como aplicativo em dispositivos móveis

## Tecnologias utilizadas

- React.js
- Vite
- Tailwind CSS
- React Router
- API REST
- LocalStorage para cache
- Axios para requisições HTTP
- PWA para instalação em dispositivos

## Estrutura do projeto

```
src/
  ├── api/              # Serviços de API e camada de comunicação
  ├── assets/           # Recursos estáticos (imagens, fontes)
  ├── components/       # Componentes reutilizáveis
  │   └── evento/       # Componentes específicos de eventos
  │   └── forms/        # Componentes de formulários
  ├── context/          # Contextos React para gerenciamento de estado global
  ├── hook/             # Hooks personalizados
  ├── layouts/          # Estruturas de layout da aplicação
  ├── middleware/       # Middleware para processamento de dados
  ├── pages/            # Páginas da aplicação
  └── utils/            # Funções utilitárias
```

## Instalação e execução

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/minhacidade-mvp.git
cd minhacidade-mvp
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```
VITE_APP_API_URL=sua_url_da_api
VITE_APP_GOOGLE_MAPS_KEY=sua_chave_google_maps
```

4. Execute o projeto em desenvolvimento:
```bash
npm run dev
```

5. Para gerar a build de produção:
```bash
npm run build
npm run preview
```

## Fluxo de trabalho do usuário

1. **Página inicial**: Visualize o calendário com eventos do dia atual
2. **Filtro por categorias**: Selecione uma categoria específica para filtrar eventos
3. **Detalhes do evento**: Clique em um evento para ver informações completas
4. **Adicionar evento**: Use o formulário para submeter um novo evento para moderação

## Recursos avançados

- **Sistema de cache**: Armazenamento local para melhor performance e uso offline
- **Validação de dados**: Verificação de entradas para garantir integridade dos dados
- **Proteção contra bots**: Implementação de captcha para formulários
- **Análise de descrições**: Processamento inteligente de textos com estruturas JSON

## Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob os termos da licença MIT.

## Contato

Minha Cidade - [Instagram](https://www.instagram.com/minha_cidadeapp/)

---

© 2023 Minha Cidade. Todos os direitos reservados.