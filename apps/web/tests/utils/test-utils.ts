// Test utilities for Nexus Sales E2E tests

/**
 * Generates a random email address for testing purposes
 */
export const generateRandomEmail = (): string => {
  return `test-${Date.now()}-${Math.random().toString(36).substring(2, 10)}@example.com`;
};

/**
 * Generates a random password that meets common security requirements
 */
export const generateRandomPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

/**
 * Waits for a specific network request to complete
 */
export const waitForNetworkIdle = async (page) => {
  await page.route('**/*', (route) => {
    route.continue();
  });
  
  // Wait for network to be idle
  await page.waitForLoadState('networkidle');
};

/**
 * Waits for a specific API call to complete
 */
export const waitForApiCall = async (page, urlPattern) => {
  const [response] = await Promise.all([
    page.waitForResponse(urlPattern),
    // Add your action that triggers the API call here
  ]);
  return response;
};

/**
 * Generates test data for a product
 */
export const generateProductData = () => {
  return {
    name: `Test Product ${Date.now()}`,
    description: `Test product description generated at ${new Date().toISOString()}`,
    price: Math.floor(Math.random() * 900) + 100, // Random price between 100 and 1000
  };
};

/**
 * Generates test data for an order
 */
export const generateOrderData = () => {
  const statuses = ['created', 'processing', 'paid', 'refunded', 'cancelled'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  return {
    email: generateRandomEmail(),
    name: `Test Customer ${Date.now()}`,
    status: randomStatus,
    amount: Math.floor(Math.random() * 900) + 100, // Random amount between 100 and 1000
  };
};

/**
 * Checks if an element exists on the page
 */
export const elementExists = async (page, selector) => {
  try {
    const element = await page.waitForSelector(selector, { timeout: 3000 });
    return !!element;
  } catch (error) {
    return false;
  }
};

/**
 * Retry an action with a timeout
 */
export const retry = async (fn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Waits for a specific text to appear on the page
 */
export const waitForText = async (page, text, timeout = 10000) => {
  await page.waitForFunction(
    (textContent) => {
      return document.body && document.body.textContent && document.body.textContent.includes(textContent);
    },
    text,
    { timeout }
  );
};