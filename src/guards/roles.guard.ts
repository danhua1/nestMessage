import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enum/role.enum';
import { ROLES_KEY } from '../decorator/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
            ROLES_KEY,
            [
                context.getHandler(),
                context.getClass(),
            ]
        );
        if (!requiredRoles) {
            return true;
        }
        //获取auth.guard添加的role（通过token查询个人信息，然后查询表获取个人的角色信息）
        //建议修改逻辑，如果一个人存在多个角色，那么此时的判断是异常的
        const role = context.switchToHttp().getRequest()?.user?.role;
        if (role === 'admin') {
            // Admin opens all permissions
            // 管理员开放所有权限
            return true;
        }
        return requiredRoles.some(r => r === role);
    }
}