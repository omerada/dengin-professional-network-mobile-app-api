// Test file for error handling
// Bu dosya test amaçlıdır, production'da kullanılmaz

import { getErrorMessage, isNetworkError } from './errorUtils';
import { AxiosError } from 'axios';

// Test 1: Backend 401 error
const test401 = () => {
  const error = {
    isAxiosError: true,
    response: {
      status: 401,
      data: {
        status: 401,
        error: 'Authentication Failed',
        message: 'Geçersiz kimlik bilgileri',
        errorCode: 'AUTH_INVALID_CREDENTIALS',
      },
    },
  } as AxiosError;

  console.log('Test 401:', getErrorMessage(error));
  // Expected: "E-posta veya şifre hatalı"
};

// Test 2: Network error
const testNetwork = () => {
  const error = {
    isAxiosError: true,
    message: 'Network Error',
    code: 'ECONNABORTED',
  } as AxiosError;

  console.log('Test Network:', getErrorMessage(error));
  console.log('Is Network Error:', isNetworkError(error));
  // Expected: "İstek zaman aşımına uğradı, lütfen tekrar deneyin", true
};

// Test 3: Simple Error
const testSimpleError = () => {
  const error = new Error('Oturum bilgisi bulunamadı');
  console.log('Test Simple:', getErrorMessage(error));
  // Expected: "Oturum bilgisi bulunamadı"
};

// Test 4: String error
const testString = () => {
  const error = 'Dosya boyutu çok büyük';
  console.log('Test String:', getErrorMessage(error));
  // Expected: "Dosya boyutu çok büyük"
};

// Test 5: Unknown error
const testUnknown = () => {
  const error = null;
  console.log('Test Unknown:', getErrorMessage(error));
  // Expected: "Bilinmeyen bir hata oluştu"
};

// Run all tests
export const runErrorTests = () => {
  console.log('=== Error Handling Tests ===');
  test401();
  testNetwork();
  testSimpleError();
  testString();
  testUnknown();
  console.log('=== Tests Complete ===');
};
