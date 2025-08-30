# Contexto

Estou desenvolvendo a plataforma Coink, que visa simplificar o gerenciamento financeiro pessoal. A plataforma permitirá que os usuários categorizem suas transações, acompanhem seus gastos e recebam insights sobre suas finanças.

# Objetivos

1. **Categorização de Transações**: Permitir que os usuários classifiquem suas transações em categorias personalizáveis.
2. **Acompanhamento de Gastos**: Fornecer ferramentas para que os usuários monitorem seus gastos ao longo do tempo.
3. **Insights Financeiros**: Oferecer relatórios e análises que ajudem os usuários a entender melhor suas finanças.

# Funcionalidades

1. **Cadastro de Usuário**: Permitir que novos usuários se cadastrem na plataforma.
2. **Login Seguro**: Implementar autenticação para proteger as contas dos usuários.
3. **Dashboard Personalizado**: Criar uma interface inicial que mostre um resumo das finanças do usuário.
4. **Tabela de Gastos**: Exibir uma lista detalhada das transações do usuário, com opções de filtragem por categoria, data e valor.
5. **Relatórios Financeiros**: Gerar relatórios que forneçam insights sobre os hábitos de gastos do usuário.
6. **Adicionar Despesa ou Receita**: Permitir que os usuários registrem novas transações, classificando-as como despesas ou receitas que será apresentada no dashboard e na tabela, para adicionar sera em um botao na sidebar com um botao de +.
7. **Landing Page**: Criar uma página inicial atraente que forneça uma visão geral das principais funcionalidades da plataforma e incentive os usuários a se cadastrarem ou fazerem login.

## Instruções

- Desenvolva seguindo a melhor estrutura para projetos nextjs
- Utilize componentes funcionais, hooks e contextos do React para gerenciar estado e efeitos colaterais.
- Utilize o máximo de SSR com server Actions do Nextjs e na pasta src/server/actions
- Prefira Interfaces ao inves de tipos.
- Categorize os componentes de acordo com sua funcionalidade e reutilização.
- Categorize os tipos de client side e server side, se for em server side ficará em src/server/types se em client side em src/@types
- Utilize os componentes do Shadcn/ui ja instalados em components/ui
- Use a biblioteca next/auth para gerenciar a autenticação dos usuários.
- Crie .env.example contendo o que deve ter de forma bem estruturada e separada e fora da .gitignore, tanto para o front quanto para o backend
- Utilize o axios para fazer requisições ao backend com um arquivo api.ts dentro de src/server/lib e que mude para receber o token de autenticacao do usuario se ele possuir
- Utilize React Query para gerenciar as requisicoes em client side, mas chamando uma server action que realizara a requisicao para ele
- Crie contextos para onde for necessário e lazy loadings serão implementados com Skeletons e/ou Spinner Loader
- Siga a estrutura de pastas e arquivos do Next.js para organizar seu código de forma eficiente.
- Componentes, tipos e contextos ligados a apenas uma página ficarão dentro da pasta dela em uma subpasta chamada _components, _types, _context.
- Utilize o padrão de navegacao do next, nao use ancoras mas sim Link.
- O tema padrão será o escuro padrao do Shadcn/ui, nao tera modo claro.
- Utilize os arquivos page.tsx ja criados para manter a estruturacao.
- Mantenha os componentes bem separados em arquivos, podendo os organizar em uma pasta se mantiverem um contexto conjunto.
