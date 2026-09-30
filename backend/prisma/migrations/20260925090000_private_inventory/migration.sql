ALTER TABLE public."InventoryItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."InventoryMovement" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."InventoryItem", public."InventoryMovement" FROM anon, authenticated;
