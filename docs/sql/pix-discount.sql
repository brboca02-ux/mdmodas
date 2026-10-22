-- Desconto de 5% no Pix, aplicado no servidor (não destrutivo).
-- Quando place_order grava o subtotal de um pedido Pix aguardando pagamento,
-- este gatilho calcula discount = 5% do subtotal e recalcula o total.
CREATE OR REPLACE FUNCTION public.orders_apply_pix_discount()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.payment_method::text = 'pix'
     AND NEW.status::text = 'aguardando_pagamento'
     AND NEW.subtotal IS DISTINCT FROM OLD.subtotal THEN
    NEW.discount := round(COALESCE(NEW.subtotal,0) * 0.05, 2);
    NEW.total    := round(COALESCE(NEW.subtotal,0) + COALESCE(NEW.shipping_cost,0) - NEW.discount, 2);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_orders_pix_discount ON public.orders;
CREATE TRIGGER trg_orders_pix_discount
BEFORE UPDATE OF subtotal ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.orders_apply_pix_discount();
