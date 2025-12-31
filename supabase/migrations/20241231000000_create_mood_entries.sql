-- Create mood_entries table
create table public.mood_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  level smallint not null check (level >= 1 and level <= 5),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Each user can only have one entry per date
  unique(user_id, date)
);

-- Enable Row Level Security
alter table public.mood_entries enable row level security;

-- Create policies
create policy "Users can view their own mood entries"
  on public.mood_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert their own mood entries"
  on public.mood_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own mood entries"
  on public.mood_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete their own mood entries"
  on public.mood_entries for delete
  using (auth.uid() = user_id);

-- Create index for faster queries
create index mood_entries_user_id_date_idx on public.mood_entries(user_id, date);

-- Create function to automatically update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger on_mood_entry_updated
  before update on public.mood_entries
  for each row
  execute function public.handle_updated_at();
