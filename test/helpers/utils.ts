import { randomBytes } from 'crypto';

export function random(): string {
	return randomBytes(16).toString('hex');
}
