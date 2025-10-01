import { TextEncoder, TextDecoder } from 'util'

// Polyfill for TextEncoder/TextDecoder (needed for pg crypto)
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
