-- 플랫폼 (스마트스토어, G마켓 등)
create table platforms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  style_guide text,
  created_at timestamptz default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references auth.users(id) not null,
  planner_id uuid references auth.users(id),
  designer_id uuid references auth.users(id),
  status text not null default 'intake_submitted',
  company_name text not null,
  homepage_url text,
  detail_page_url text,
  product_highlights text,
  reference_notes text,
  platform_id uuid references platforms(id),
  category text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table scripts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) not null,
  content jsonb not null,
  ai_model text,
  planner_status text default 'pending',
  planner_notes text,
  version int default 1,
  created_at timestamptz default now()
);

create table photos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) not null,
  storage_path text not null,
  photo_type text not null,
  is_retouched boolean default false,
  retouched_path text,
  shooting_list_item text,
  created_at timestamptz default now()
);

create table designs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) not null,
  preview_url text,
  output_url text,
  designer_status text default 'pending',
  designer_notes text,
  version int default 1,
  created_at timestamptz default now()
);

create table project_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) not null,
  from_status text,
  to_status text not null,
  changed_by uuid references auth.users(id),
  note text,
  created_at timestamptz default now()
);

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on projects
  for each row execute function update_updated_at();
