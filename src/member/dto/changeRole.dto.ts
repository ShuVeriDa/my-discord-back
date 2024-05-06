import { IsOptional, IsString } from 'class-validator';
import { MemberRole } from '@prisma/client';

export class ChangeRoleDto {
  @IsOptional()
  @IsString()
  serverId?: string;

  @IsString()
  role: MemberRole;
}
