import { Injectable, inject } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Observable, map } from 'rxjs';
import * as jose from 'jose';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private auth0Service: Auth0Service = inject(Auth0Service);

  hasPermission(permission: string): Observable<boolean> {
    return this.auth0Service.getAccessTokenSilently().pipe(
      map((token) => {
        // Decode de token
        const decodedToken = jose.decodeJwt(token) as {permissions: string[]} | null;
        
        // Check voor permissions in de decoded token
        if (
          decodedToken &&
          decodedToken.permissions &&
          decodedToken.permissions.includes(permission)
        ) {
          // User heeft de vereiste permission
          return true;
        } else {
          // // User heeft de vereiste permission niet
          // console.log(
          //   'Unauthorized: User does not have the required permission.'
          // );
          // // log welke permissie er ontbreekt
          // console.log(`Missing permission: ${permission}`);

          // log de perissions die ontbreken
          const missingPermissions = decodedToken?.permissions?.filter(
            (perm) => !decodedToken.permissions.includes(perm)
          );

        }
        return false;
      })
    );
  }
}