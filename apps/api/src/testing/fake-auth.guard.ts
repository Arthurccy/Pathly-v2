/**
 * DOUBLURE DE TEST du SupabaseAuthGuard — jamais enregistrée dans un module applicatif.
 * `Authorization: Bearer <userId>` → req.user.id = <userId> ; sinon 401, comme le guard réel.
 */
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class FakeAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const header: string | undefined = request.headers['authorization'];
    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException("Token d'authentification manquant");
    }
    request.user = { id: header.slice('Bearer '.length).trim() };
    return true;
  }
}
