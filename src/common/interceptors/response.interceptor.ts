import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // Si la réponse contient déjà le format standard, la retourner telle quelle
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Si la réponse contient une pagination (ancien format)
        if (data && typeof data === 'object' && 'data' in data && 'total' in data) {
          return {
            success: true,
            data: data.data,
            pagination: {
              total: data.total,
              page: data.page || 1,
              limit: data.limit || 10,
              pages: data.totalPages || Math.ceil(data.total / (data.limit || 10)),
            },
          };
        }

        // Format standard pour les autres réponses
        return {
          success: true,
          data,
        };
      }),
    );
  }
}
