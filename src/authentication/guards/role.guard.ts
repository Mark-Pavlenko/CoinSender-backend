import Roles from '../enum/role.enum';
import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import RequestWithAdministrator from '../interfaces/administrator.interface';
import JwtAuthenticationGuard from './authentication.guard';

const RoleGuard = (roles: Roles): Type<CanActivate> => {
  class RoleGuardMixin extends JwtAuthenticationGuard {
    async canActivate(context: ExecutionContext) {
      await super.canActivate(context);

      const req = context.switchToHttp().getRequest<RequestWithAdministrator>();
      const user = req.user;

      return user?.role.includes(roles);
    }
  }

  return mixin(RoleGuardMixin);
};

export default RoleGuard;
