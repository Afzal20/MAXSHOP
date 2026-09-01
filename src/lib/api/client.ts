export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface FetchOptions extends RequestInit {
  tags?: string[];
  revalidate?: number;
}

export async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { tags, revalidate, ...init } = options;
  const url = `${API_BASE_URL}${endpoint}`;

  const fetchOptions: RequestInit = {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  };

  if (tags || revalidate !== undefined) {
    fetchOptions.next = { 
      ...(tags && { tags }),
      ...(revalidate !== undefined && { revalidate })
    };
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    let errorDetail = 'API request failed';
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || errorDetail;
    } catch (e) {
      // Ignored
    }
    throw new Error(`Error ${response.status}: ${errorDetail}`);
  }

  // Handle empty responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
