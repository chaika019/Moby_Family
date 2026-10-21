import type { FormEvent } from 'react';
import type { Command, Role } from '../lib/demo';
export type ModalKind = 'topup'
  | 'qr'
  | 'save'
  | 'limits'
  | 'chore'
  | 'allowance'
  | 'capital'
  | 'shop'
  | 'lesson'
  | 'history'
  | 'benefits'
  | 'ride'
  | 'split'
  | 'connect'
  | 'notifications'
  | 'help'
  | 'card';
export type Modal = ModalKind | null;
export type ExecuteCommand = (command: Command, message?: string) => Promise<boolean>;
export type Notify = (role: Role, text: string, error?: boolean) => void;
export type SubmitForm = (event: FormEvent<HTMLFormElement>, action: (data: FormData) => Promise<boolean>) => void | Promise<void>;
export interface ToastMessage {
  role: Role;
  text: string;
  error: boolean;
}
