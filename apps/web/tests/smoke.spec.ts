// Smoke tests - basic functionality tests
// These tests run with Jest and don't require a running server

describe('Smoke tests', () => {
  test('Basic math works', () => {
    expect(1 + 1).toBe(2)
  })

  test('String operations work', () => {
    expect('hello'.length).toBe(5)
    expect('hello world'.includes('world')).toBe(true)
  })

  test('Array operations work', () => {
    const arr = [1, 2, 3]
    expect(arr.length).toBe(3)
    expect(arr.includes(2)).toBe(true)
  })

  test('Object operations work', () => {
    const obj = { name: 'test', value: 42 }
    expect(obj.name).toBe('test')
    expect(obj.value).toBe(42)
  })
})
