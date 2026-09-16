create extension if not exists "uuid-ossp";

create type public.user_role as enum ('ADMIN', 'ATENDENTE');
create type public.patient_status as enum ('Ativo', 'Arquivado');
create type public.evaluation_status as enum ('Em andamento', 'Concluída', 'Cancelada');
create type public.attendance_status as enum ('Presente', 'Ausente', 'Justificado', 'Cancelado');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role public.user_role not null default 'ATENDENTE',
  avatar_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.patients (
  id uuid primary key default uuid_generate_v4(),
  created_by uuid not null references public.profiles(id) on delete restrict,
  full_name text not null,
  cpf text,
  birth_date date,
  gender text,
  phone text,
  email text,
  address text,
  responsible_name text,
  responsible_phone text,
  notes text,
  status public.patient_status not null default 'Ativo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.evaluations (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  evaluation_type text not null,
  evaluation_date date not null,
  objective text,
  observations text,
  result text,
  recommendations text,
  status public.evaluation_status not null default 'Em andamento',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  report_type text not null,
  content text,
  report_date date not null,
  observations text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.attendances (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  attendance_date date not null,
  attendance_time time not null,
  status public.attendance_status not null default 'Presente',
  notes text,
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  file_name text not null,
  file_path text not null,
  file_type text,
  file_size bigint,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete restrict,
  action text not null,
  description text,
  created_at timestamptz not null default now()
);

create index idx_profiles_email on public.profiles(email);
create index idx_patients_created_by on public.patients(created_by);
create index idx_patients_status on public.patients(status);
create index idx_evaluations_patient on public.evaluations(patient_id);
create index idx_reports_patient on public.reports(patient_id);
create index idx_attendances_patient on public.attendances(patient_id);
create index idx_documents_patient on public.documents(patient_id);
create index idx_audit_logs_patient on public.audit_logs(patient_id);

alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.evaluations enable row level security;
alter table public.reports enable row level security;
alter table public.attendances enable row level security;
alter table public.documents enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles_select_own_or_admin" on public.profiles
for select using (
  auth.uid() = id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'
  )
);

create policy "profiles_update_own_or_admin" on public.profiles
for update using (
  auth.uid() = id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'
  )
) with check (
  auth.uid() = id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'
  )
);

create policy "patients_select_own_or_admin" on public.patients
for select using (
  auth.uid() = created_by or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'
  )
);

create policy "patients_insert_own" on public.patients
for insert with check (
  auth.uid() = created_by
);

create policy "patients_update_own_or_admin" on public.patients
for update using (
  auth.uid() = created_by or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'
  )
) with check (
  auth.uid() = created_by or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'
  )
);

create policy "patients_delete_admin_only" on public.patients
for delete using (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'
  )
);

create policy "evaluations_select_own_or_admin" on public.evaluations
for select using (
  auth.uid() = created_by or exists (
    select 1 from public.patients pa where pa.id = patient_id and pa.created_by = auth.uid()
  ) or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'
  )
);

create policy "evaluations_insert_own" on public.evaluations
for insert with check (
  auth.uid() = created_by
);

create policy "evaluations_update_own_or_admin" on public.evaluations
for update using (
  auth.uid() = created_by or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'
  )
) with check (
  auth.uid() = created_by or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'
  )
);

create policy "reports_select_own_or_admin" on public.reports
for select using (
  auth.uid() = created_by or exists (
    select 1 from public.patients pa where pa.id = patient_id and pa.created_by = auth.uid()
  ) or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'
  )
);

create policy "reports_insert_own" on public.reports
for insert with check (
  auth.uid() = created_by
);

create policy "reports_update_own_or_admin" on public.reports
for update using (
  auth.uid() = created_by or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'
  )
) with check (
  auth.uid() = created_by or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'
  )
);

create policy "attendances_select_own_or_admin" on public.attendances
for select using (
  auth.uid() = created_by or exists (
    select 1 from public.patients pa where pa.id = patient_id and pa.created_by = auth.uid()
  ) or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'
  )
);

create policy "attendances_insert_own" on public.attendances
for insert with check (
  auth.uid() = created_by
);

create policy "documents_select_own_or_admin" on public.documents
for select using (
  exists (
    select 1 from public.patients pa where pa.id = patient_id and pa.created_by = auth.uid()
  ) or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'
  )
);

create policy "documents_insert_own" on public.documents
for insert with check (
  auth.uid() = uploaded_by
);

create policy "audit_logs_select_own_or_admin" on public.audit_logs
for select using (
  auth.uid() = user_id or exists (
    select 1 from public.patients pa where pa.id = patient_id and pa.created_by = auth.uid()
  ) or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'
  )
);

create policy "audit_logs_insert_own" on public.audit_logs
for insert with check (
  auth.uid() = user_id
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role, active)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.email, 'ATENDENTE', true)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
before update on public.profiles
for each row execute procedure public.update_updated_at_column();

create trigger patients_updated_at
before update on public.patients
for each row execute procedure public.update_updated_at_column();

create trigger evaluations_updated_at
before update on public.evaluations
for each row execute procedure public.update_updated_at_column();

create trigger reports_updated_at
before update on public.reports
for each row execute procedure public.update_updated_at_column();

create policy "storage_documents_select" on storage.objects for select using (
  bucket_id = 'documents' and (
    exists (
      select 1 from public.documents d
      join public.patients p on p.id = d.patient_id
      where d.file_path = storage.objects.name and p.created_by = auth.uid()
    ) or exists (
      select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'ADMIN'
    )
  )
);

create policy "storage_documents_insert" on storage.objects for insert with check (
  bucket_id = 'documents' and auth.uid() is not null
);

create policy "storage_documents_update" on storage.objects for update using (
  bucket_id = 'documents' and auth.uid() is not null
);

create policy "storage_documents_delete" on storage.objects for delete using (
  bucket_id = 'documents' and auth.uid() is not null
);
