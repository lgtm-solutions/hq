/// <reference types="@sveltejs/kit" />
import type { HQConfig } from '@hq/config';

declare global {
  namespace App {
    interface Locals {
      config: HQConfig;
    }
  }
}
export {};
