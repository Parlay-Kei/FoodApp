-- Create carts table
create table if not exists carts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  items jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Enable RLS
alter table carts enable row level security;

-- Create policies
create policy "Users can view their own cart"
  on carts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own cart"
  on carts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own cart"
  on carts for update
  using (auth.uid() = user_id);

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger update_carts_updated_at
  before update on carts
  for each row
  execute function update_updated_at_column(); 