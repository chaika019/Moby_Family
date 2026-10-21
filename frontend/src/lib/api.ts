export type { LiveState } from './server/types';
export const baseURL = (import.meta.env?.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');
export class ApiError extends Error {
  constructor(message: string, public status = 0, public code = 'NETWORK_ERROR') { super(message); }
}
interface Options { method?: string; body?: unknown; token?: string; key?: string; signal?: AbortSignal }
export async function request<T>(path: string, options: Options = {}): Promise<T> {
  // A retry uses exactly the same command key and payload, including after a timeout.
  const attempts = options.key ? 2 : 1;
  for (let attempt = 0; attempt < attempts; attempt++) {
    const abort = new AbortController();
    const cancel = () => abort.abort();
    options.signal?.addEventListener('abort', cancel, {once:true});
    const timer = setTimeout(cancel, 12000);
    try {
      if (options.signal?.aborted) abort.abort();
      const response = await fetch(baseURL + path, {
        method: options.method || (options.body === undefined ? 'GET' : 'POST'),
        headers: { Accept:'application/json', ...(options.body === undefined ? {} : {'Content-Type':'application/json'}),
          ...(options.token ? {Authorization:`Bearer ${options.token}`} : {}), ...(options.key ? {'Idempotency-Key':options.key} : {}) },
        body: options.body === undefined ? undefined : JSON.stringify(options.body), signal:abort.signal,
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new ApiError(result?.message || `Ошибка сервера ${response.status}`, response.status, result?.code);
      if (result === null) throw new ApiError('Сервер вернул пустой ответ', response.status, 'INVALID_RESPONSE');
      return result as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (options.signal?.aborted) throw error;
      if (attempt + 1 === attempts) throw new ApiError('Нет ответа сервера. Соединение прервано; проверь историю перед новой оплатой.');
    } finally { clearTimeout(timer); options.signal?.removeEventListener('abort', cancel); }
  }
  throw new ApiError('Не удалось выполнить запрос');
}
export function apiError(error: unknown): string { return error instanceof Error ? error.message : 'Не удалось выполнить действие'; }
