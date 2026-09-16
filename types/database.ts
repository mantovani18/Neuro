export type Role = "ADMIN" | "ATENDENTE";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  avatar_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type PatientStatus = "Ativo" | "Arquivado";
export type Patient = {
  id: string;
  created_by: string;
  full_name: string;
  cpf: string | null;
  birth_date: string | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  responsible_name: string | null;
  responsible_phone: string | null;
  notes: string | null;
  status: PatientStatus;
  created_at: string;
  updated_at: string;
};

export type EvaluationStatus = "Em andamento" | "Concluída" | "Cancelada";
export type Evaluation = {
  id: string;
  patient_id: string;
  created_by: string;
  evaluation_type: string;
  evaluation_date: string;
  objective: string | null;
  observations: string | null;
  result: string | null;
  recommendations: string | null;
  status: EvaluationStatus;
  created_at: string;
  updated_at: string;
};

export type Report = {
  id: string;
  patient_id: string;
  created_by: string;
  title: string;
  report_type: string;
  content: string | null;
  report_date: string;
  observations: string | null;
  created_at: string;
  updated_at: string;
};

export type AttendanceStatus = "Presente" | "Ausente" | "Justificado" | "Cancelado";
export type Attendance = {
  id: string;
  patient_id: string;
  created_by: string;
  attendance_date: string;
  attendance_time: string;
  status: AttendanceStatus;
  notes: string | null;
  created_at: string;
};

export type DocumentRecord = {
  id: string;
  patient_id: string;
  uploaded_by: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
};

export type AuditLog = {
  id: string;
  patient_id: string;
  user_id: string;
  action: string;
  description: string | null;
  created_at: string;
};

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Profile>;
      };
      patients: {
        Row: Patient;
        Insert: Omit<Patient, "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Patient>;
      };
      evaluations: {
        Row: Evaluation;
        Insert: Omit<Evaluation, "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Evaluation>;
      };
      reports: {
        Row: Report;
        Insert: Omit<Report, "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Report>;
      };
      attendances: {
        Row: Attendance;
        Insert: Omit<Attendance, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Attendance>;
      };
      documents: {
        Row: DocumentRecord;
        Insert: Omit<DocumentRecord, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<DocumentRecord>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<AuditLog>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: Role;
      patient_status: PatientStatus;
      evaluation_status: EvaluationStatus;
      attendance_status: AttendanceStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
