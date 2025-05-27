-- Create carts table
create table carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  items jsonb not null,
  updated_at timestamp with time zone default current_timestamp,
  created_at timestamp with time zone default current_timestamp
);

-- Update timestamp trigger
create or replace function update_cart_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_cart_updated_at
before update on carts
for each row
execute procedure update_cart_timestamp();

-- Enable RLS
alter table carts enable row level security;

-- Policy to allow users to manage their own carts
create policy "Users can manage their own cart"
on carts
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
