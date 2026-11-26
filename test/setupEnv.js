// Roda antes de qualquer módulo de teste: fixa a URL da API para os asserts não dependerem do .env.
process.env.EXPO_PUBLIC_API_URL = 'http://api.test';
