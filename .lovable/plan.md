# Parcelas sincronizadas com as taxas do Mercado Pago

## Problema atual
- A página do produto mostra um texto fixo "ou 4x de R$ X sem juros", que não bate com o que o Mercado Pago cobra.
- O pagamento com cartão permite até 12x, mas a loja quer no máximo 4x.

## O que será feito
1. **Consulta real ao Mercado Pago**: o site pergunta ao Mercado Pago o valor exato de cada parcela (1x a 4x) para o preço do produto, usando as taxas configuradas na conta da loja. Resultado guardado por alguns minutos para não deixar a página lenta.
2. **Página do produto**: troca o texto fixo por "ou até 4x de R$ X" com o rótulo correto ("sem juros" ou "com juros", conforme o Mercado Pago responder) e um link "Ver parcelas" que abre a tabela 1x, 2x, 3x, 4x com valor da parcela e total.
3. **Checkout / carrinho**: mesma tabela calculada sobre o total do pedido.
4. **Pagamento com cartão**: limite de 4x no formulário do cartão e no Checkout Pro. O próprio Mercado Pago mostra os juros de 3x e 4x, então o valor cobrado será igual ao exibido no site.
5. **Se a consulta falhar**: mostra apenas "Parcele em até 4x no cartão", sem valores inventados.

## Importante
- Se 1x e 2x forem sem juros (custo absorvido pela loja), isso precisa estar configurado no painel do Mercado Pago (Seu negócio > Custos > Parcelamento). O site apenas reflete o que estiver lá.

## Detalhes técnicos
- Nova server function `getMpInstallments({ amount })` chamando `GET https://api.mercadopago.com/v1/payment_methods/installments?amount=&payment_method_id=master` com `MP_ACCESS_TOKEN`; filtra `payer_costs` com `installments <= 4`; retorna `{ installments, installmentAmount, totalAmount, rate }`. Cache em memória de 10 min por valor.
- Componente `InstallmentsInfo` usado em `produto.$handle.tsx` e `checkout.tsx` (React Query).
- `CardBrickPayment.tsx`: `maxInstallments: 4`. `mercadopago.functions.ts`: `installments: 4`.
