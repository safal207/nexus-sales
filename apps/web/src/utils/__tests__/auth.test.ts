import { generateToken, verifyToken, requireAuth, extractTokenFromRequest } from '../auth'
import { NextRequest } from 'next/server'

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}))

import jwt from 'jsonwebtoken'

const mockedJwt = jwt as jest.Mocked<typeof jwt>
const createMockRequest = (authorization?: string): NextRequest => {
  const headers = new Headers()
  if (authorization) {
    headers.set('authorization', authorization)
  }
  return { headers } as NextRequest
}

describe('Auth Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateToken', () => {
    beforeEach(() => {
      process.env.JWT_SECRET = 'test-secret'
    })

    it('should generate a token with correct payload', () => {
      const payload = { userId: 1, email: 'test@test.com' }
      const mockToken = 'mock-jwt-token'

      mockedJwt.sign.mockReturnValue(mockToken as unknown as never)

      const result = generateToken(payload)

      expect(mockedJwt.sign).toHaveBeenCalledWith(
        payload,
        'test-secret',
        { expiresIn: '7d' }
      )
      expect(result).toBe(mockToken)
    })

    it('should use default secret when JWT_SECRET not set', () => {
      const payload = { userId: 1, email: 'test@test.com' }

      // Clear the env var within the test scope
      delete process.env.JWT_SECRET

      generateToken(payload)

      expect(mockedJwt.sign).toHaveBeenCalledWith(
        payload,
        'default-secret-change-in-production',
        { expiresIn: '7d' }
      )
    })
  })

  describe('verifyToken', () => {
    beforeEach(() => {
      process.env.JWT_SECRET = 'test-secret'
    })

    it('should verify valid token', () => {
      const mockPayload = { userId: 1, email: 'test@test.com', iat: 123, exp: 456 }
      mockedJwt.verify.mockReturnValue(mockPayload as unknown as never)

      const result = verifyToken('valid-token')

      expect(mockedJwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret')
      expect(result).toEqual(mockPayload)
    })

    it('should return null for invalid token', () => {
      mockedJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const result = verifyToken('invalid-token')

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('JWT verification failed:', expect.any(Error))

      consoleSpy.mockRestore()
    })

    it('should handle expired token', () => {
      mockedJwt.verify.mockImplementation(() => {
        const error = new Error('Token expired')
        error.name = 'TokenExpiredError'
        throw error
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const result = verifyToken('expired-token')

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('JWT verification failed:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('extractTokenFromRequest', () => {
    it('should extract token when Bearer prefix present', () => {
      const request = createMockRequest('Bearer abc.def.ghi')

      const token = extractTokenFromRequest(request)

      expect(token).toBe('abc.def.ghi')
    })

    it('should return null when header missing', () => {
      const request = createMockRequest()

      expect(extractTokenFromRequest(request)).toBeNull()
    })

    it('should return null when header does not start with Bearer space', () => {
      const request = createMockRequest('Basic token')

      expect(extractTokenFromRequest(request)).toBeNull()
    })

    it('should return null for Bearer without token', () => {
      const request = createMockRequest('Bearer ')

      expect(extractTokenFromRequest(request)).toBeNull()
    })
  })

  describe('requireAuth', () => {
    it('should return user payload for valid Bearer token', () => {
      const mockPayload = { userId: 1, email: 'test@test.com' }
      mockedJwt.verify.mockReturnValue(mockPayload as unknown as never)

      const request = createMockRequest('Bearer valid-token')
      const result = requireAuth(request)

      expect(result).toEqual(mockPayload)
    })

    it('should return null when no authorization header', () => {
      const request = createMockRequest()
      const result = requireAuth(request)

      expect(result).toBeNull()
    })

    it('should return null when authorization header malformed', () => {
      const request = createMockRequest('invalid-header')
      const result = requireAuth(request)

      expect(result).toBeNull()
    })

    it('should return null when token is invalid', () => {
      mockedJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const request = createMockRequest('Bearer invalid-token')
      const result = requireAuth(request)

      expect(result).toBeNull()
    })

    it('should handle Bearer token without space', () => {
      const request = createMockRequest('Bearer')
      const result = requireAuth(request)

      expect(result).toBeNull()
    })

    it('should handle empty Bearer token', () => {
      const request = createMockRequest('Bearer ')
      const result = requireAuth(request)

      expect(result).toBeNull()
    })
  })

  describe('integration tests', () => {
    it('should generate and verify token round trip', () => {
      const payload = { userId: 123, email: 'integration@test.com' }
      const mockToken = 'generated-token'

      // Mock generation
      mockedJwt.sign.mockReturnValue(mockToken as unknown as never)

      const generatedToken = generateToken(payload)

      // Mock verification
      mockedJwt.verify.mockReturnValue({ ...payload, iat: 123, exp: 456 } as unknown as never)

      const verifiedPayload = verifyToken(generatedToken)

      expect(generatedToken).toBe(mockToken)
      expect(verifiedPayload).toMatchObject(payload)
    })

    it('should handle auth flow with request', () => {
      const payload = { userId: 456, email: 'flow@test.com' }
      const token = 'flow-token'

      // Mock token verification for request
      mockedJwt.verify.mockReturnValue(payload as unknown as never)

      const request = createMockRequest(`Bearer ${token}`)
      const authResult = requireAuth(request)

      expect(authResult).toEqual(payload)
    })
  })
})
