# Corrigir listagem da categoria Feminino

## O problema

A página `/colecao?c=feminino` não mostra todas as peças da categoria por dois motivos confirmados no código:

1. **Limite fixo de 12 produtos.** `ProductGrid` recebe `first = 12` por padrão e a página de coleção não passa outro valor — então, mesmo que existam 20 ou 30 peças femininas, só 12 aparecem, sem paginação nem botão "ver mais".
2. **Filtro por texto em vez de categoria.** A coleção passa o slug (`feminino`) como termo de busca livre. O `ProductGrid` compara esse texto com nome, descrição e categoria. Isso causa dois desvios: peças de outras categorias entram só porque a palavra aparece na descrição, e peças femininas cadastradas com outro `category_id` (por exemplo "vestidos" ou "plus-size") não entram, mesmo sendo moda feminina.

## O que será feito

- Adicionar um filtro real por categoria no `ProductGrid` (comparação direta com o `category_id` do produto), separado da busca por texto usada no campo de pesquisa.
- A página de coleção passa a usar esse filtro de categoria quando há um chip selecionado, e busca por texto apenas quando vem de uma pesquisa.
- Remover o teto de 12 itens na coleção: mostrar todos os produtos ativos da categoria, com carregamento incremental ("Carregar mais", 24 por vez) para não pesar em telas com muitas peças.
- Exibir a contagem de peças encontradas no topo da grade.

## Detalhes técnicos

- `src/components/ProductGrid.tsx`: nova prop opcional `category?: string`; quando presente, filtra `p.category_id === category` antes do filtro de texto. `first` passa a aceitar um valor alto/`Infinity`.
- `src/routes/colecao.tsx`: passa `category={safe}` em vez de `query={safe}`; mantém `query` só para busca textual. Estado local de paginação incremental.
- Sem alterações de banco de dados nem de regras de acesso.

## Verificação

Abrir `/colecao?c=feminino` e conferir que a contagem exibida bate com o número de peças ativas com categoria Feminino no painel `/produtos`, e que nenhuma peça de outra categoria aparece por coincidência de texto.
