import type { Job } from './job.d';
import type { Resume } from './profile.d';
import type { User } from './user.d';

export interface Application {
  id: string;
  job_id: string;
  user_id: string;
  resume_id: string;
  cover_letter?: string;
  /** PENDING | REVIEWING | SHORTLISTED | INTERVIEWING | REJECTED | HIRED (from BE) */
  status: string;
  created_at: string;
  
  job?: Job;
  user?: User;
  resume?: Resume;
  history?: ApplicationHistory[];
}

export interface ApplicationHistory {
  id: string;
  application_id: string;
  old_status: string;
  new_status: string;
  changed_by: string;
  changed_at: string;
  note?: string;
  
  application?: Application;
}
