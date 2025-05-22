import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  message: string;
  newAccessToken?: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    const newAccessToken = request['newAccessToken'];

    return next.handle().pipe(
      map(data => {
        const response: Response<T> = {
          data,
          message: 'Success',
        };

        if (newAccessToken) {
          response.newAccessToken = newAccessToken;
        }

        return response;
      }),
    );
  }
} 