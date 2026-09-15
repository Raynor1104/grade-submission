import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  AUTH_EXPIRED_EVENT,
  httpClient,
  setAccessTokenProvider,
} from '@/core/api/http-client'
import { ApiRequestError } from '@/core/api/types'

describe('httpClient', () => {
  beforeEach(() => {
    setAccessTokenProvider(() => 'test-token')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    setAccessTokenProvider(() => null)
  })

  it('parses JSON and adds the Bearer token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      JSON.stringify([{ id: 1 }]),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    ))
    vi.stubGlobal('fetch', fetchMock)

    await expect(httpClient.get('/student/all')).resolves.toEqual([{ id: 1 }])

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/student/all')
    expect(new Headers(options.headers).get('Authorization')).toBe('Bearer test-token')
  })

  it('handles a 204 response without parsing JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, {
      status: 204,
    })))

    await expect(httpClient.delete('/student/1')).resolves.toBeUndefined()
  })

  it('posts JSON without Bearer or auth-expired events when auth is omitted', async () => {
    const listener = vi.fn()
    window.addEventListener(AUTH_EXPIRED_EVENT, listener)
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ error: 'Unauthenticated' }),
      { status: 401 },
    ))
    vi.stubGlobal('fetch', fetchMock)

    await httpClient.post('/authenticate', {
      username: 'demo',
      password: 'secret',
    }, { auth: 'omit' }).catch(() => undefined)

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    const headers = new Headers(options.headers)
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/authenticate')
    expect(options.method).toBe('POST')
    expect(options.body).toBe(JSON.stringify({
      username: 'demo',
      password: 'secret',
    }))
    expect(headers.get('Authorization')).toBeNull()
    expect(listener).not.toHaveBeenCalled()
    window.removeEventListener(AUTH_EXPIRED_EVENT, listener)
  })

  it('normalizes backend error shapes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ message: 'Student not found', status: 404 }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      },
    )))

    const error = await httpClient.get('/student/999').catch(value => value)

    expect(error).toBeInstanceOf(ApiRequestError)
    expect(error).toMatchObject({
      status: 404,
      message: 'Student not found',
      source: 'backend',
    })
  })

  it('normalizes network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))

    await expect(httpClient.get('/student/all')).rejects.toMatchObject({
      status: 0,
      source: 'network',
    })
  })

  it('emits one auth-expired event for repeated 401 responses', async () => {
    const listener = vi.fn()
    window.addEventListener(AUTH_EXPIRED_EVENT, listener)
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => Promise.resolve(
      new Response(JSON.stringify({ error: 'Unauthenticated' }), { status: 401 }),
    )))

    await httpClient.get('/student/all').catch(() => undefined)
    await httpClient.get('/student/all').catch(() => undefined)

    expect(listener).toHaveBeenCalledTimes(1)
    window.removeEventListener(AUTH_EXPIRED_EVENT, listener)
  })
})
