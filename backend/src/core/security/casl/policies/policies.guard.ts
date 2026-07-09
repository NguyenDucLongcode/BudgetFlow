import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from '../casl-ability.factory';
import {
  PolicyHandler,
  PolicyHandlerCallback,
} from './policy-handler.interface';
import { CHECK_POLICIES_KEY } from './check-policies.decorator';
import { JwtPayload } from 'src/modules/auth/strategies/type';

function isPolicyHandler(
  handler: PolicyHandler | PolicyHandlerCallback,
): handler is PolicyHandler {
  return typeof handler !== 'function';
}

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const handlers: (PolicyHandler | PolicyHandlerCallback)[] =
      this.reflector.getAllAndOverride(CHECK_POLICIES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    // Get the request object from the execution context
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    // Create an ability for the user using the CaslAbilityFactory
    const ability = this.caslAbilityFactory.createForUser(user);

    // Check if all policy handlers allow access
    return handlers.every((handler) =>
      isPolicyHandler(handler) ? handler.handle(ability) : handler(ability),
    );
  }
}
