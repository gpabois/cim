import { expect, afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from "@testing-library/jest-dom/matchers";
import { createCimStub } from './cim-stub';

expect.extend(matchers);

beforeEach((ctx) => {
  vi.stubGlobal('cim', createCimStub());
})

afterEach(() => {
  cleanup();
});