const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
export async function retryWithBackoff(fn, retries = MAX_RETRIES, delay = RETRY_DELAY) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt < retries) {
        console.warn(`Retry ${attempt + 1} due to error:`, error.message);
        await new Promise(res => setTimeout(res, delay * Math.pow(2, attempt)));
      } else {
        console.error(`Operation failed after ${retries} retries.`);
        throw error;
      }
    }
  }
  throw new Error('Unreachable code');
}