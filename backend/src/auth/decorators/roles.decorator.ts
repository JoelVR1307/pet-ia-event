import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  VETERINARIAN = 'VETERINARIAN',
  MODERATOR = 'MODERATOR',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);