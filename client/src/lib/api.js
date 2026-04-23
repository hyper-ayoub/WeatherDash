const JSON_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: JSON_HEADERS,
    ...options,
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.detail || 'Request failed')
  }

  return payload
}

export function signUp(data) {
  return request('/backend/api/auth/signup/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function signIn(data) {
  return request('/backend/api/auth/signin/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function logOut() {
  return request('/backend/api/auth/logout/', { method: 'POST' })
}

export function getMe() {
  return request('/backend/api/auth/me/')
}

export function getHome() {
  return request('/backend/api/home/')
}