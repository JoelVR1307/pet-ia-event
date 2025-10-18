import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../auth/decorators/roles.decorator';

export class UpdateUserRoleDto {
  @IsEnum(UserRole, {
    message: 'El rol debe ser uno de: USER, ADMIN, VETERINARIAN, MODERATOR',
  })
  @IsNotEmpty({ message: 'El rol es requerido' })
  role: UserRole;
}