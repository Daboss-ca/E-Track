// src/types/nav.ts
import type { ElementType } from 'react';
import type { UserRole } from './auth';

export interface NavChild {
  id: string;
  label: string;
  path?: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: ElementType;
  children?: NavChild[];
}

export type RoleNavConfig = Record<UserRole, NavItem[]>;