// Simple fetch utilities without Firebase authentication
export async function fetchJson(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export async function authFetch(url: string, options?: RequestInit) {
  // Since we removed authentication, this is now just a simple fetch
  return fetchJson(url, options);
}

export function clearAuthToken() {
  // No-op since we don't have authentication tokens anymore
  console.log('Authentication tokens cleared (no-op)');
} 