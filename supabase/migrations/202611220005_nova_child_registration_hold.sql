-- NOVA CUIDAR+ | keep child registration closed until privacy approval
begin;
revoke execute on function public.nova_register_child(text, date, text, text) from authenticated, anon, public;
commit;
