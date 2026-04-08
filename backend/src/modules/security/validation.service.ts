import { Injectable } from '@nestjs/common';

@Injectable()
export class ValidationService {
  isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  isStrongPassword(password: string): boolean {
    return this.getPasswordStrength(password) >= 4;
  }

  getPasswordStrength(password: string): number {
    let strength = 0;

    if (!password || password.length === 0) {
      return 0;
    }

    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;

    // Character variety checks
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&#-_]/.test(password)) strength++;

    return Math.min(strength, 4);
  }

  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
