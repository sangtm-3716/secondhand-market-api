import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../../common/enums/user-role.enum';

export const ROLES = 'roles';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES, roles);
