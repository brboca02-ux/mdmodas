# Parcelas em até 2x sem juros e 5% de desconto no Pix

## Problema atual
- A página do produto mostra um texto fixo "ou 4x sem juros · 10% off no Pix".
- O pagamento com cartão permite até 12x.
- O desconto do Pix aparece só como texto: hoje o pedido é cobrado sem desconto nenhum.

## O que será feito
1. **Página do produto**: o texto passa a ser "ou 2x de R$ X sem juros · 5% off no Pix (R$ Y)", mostrando o valor já com desconto.
2. **Cartão limitado a 2x**: o formulário de cartão no checkout e o Checkout Pro só oferecem 1x ou 2x. Nada de 3x/4x.
3. **Desconto de 5% de verdade no Pix**: ao escolher Pix no checkout, o resumo mostra "Desconto Pix −5%" e o total com desconto; o QR Code é gerado com esse valor e o pedido fica salvo com o desconto (aparece no painel e na página de acompanhamento do cliente).
4. **Checkout**: o resumo mostra as opções "Pix: R$ Y (5% off)" e "Cartão: até 2x de R$ X sem juros".

## Importante
- Para o 2x ser realmente sem juros para o cliente, no painel do Mercado Pago o parcelamento sem juros em 2x precisa estar ativado (Seu negócio > Custos > Parcelamento). Caso contrário o Mercado Pago soma os juros dele no 2x.
- O cálculo do desconto é feito no servidor (o cliente não consegue alterar o valor). Isso exige rodar um pequeno SQL no seu banco externo, que vou entregar pronto — nenhum dado é apagado.

## Detalhes técnicos
- Constantes `MAX_INSTALLMENTS = 2` e `PIX_DISCOUNT_RATE = 0.05` em `src/lib/siteConfig.ts`, usadas em produto, checkout e funções de pagamento.
- `CardBrickPayment.tsx`: `maxInstallments: 2`; `mercadopago.functions.ts`: `installments: 2`; `createMpCardPayment` rejeita `installments > 2`.
- `docs/sql/pix-discount.sql`: atualiza a RPC `place_order` para receber o método de pagamento e gravar `discount = round(subtotal * 0.05, 2)` quando for Pix, recalculando `total`.
- `checkout.tsx` envia o método para `place_order` e exibe a linha de desconto; a função de Pix já lê `total` do banco, então o QR sai com o valor correto.
