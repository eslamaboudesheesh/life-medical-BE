/* eslint-disable prettier/prettier */
import * as crypto from 'crypto';

export class PaymobHmacUtil {

    /**
     * Generate HMAC SHA-512 signature
     */
    static generateHmac(data: string, secretKey: string): string {
        return crypto
            .createHmac('sha512', secretKey)
            .update(data)
            .digest('hex');
    }

    /**
     * Compare received HMAC with generated one
     */
    static verify(body: any, receivedHmac: string, secretKey: string): boolean {
        const fields = [
            'obj.id',
            'obj.amount_cents',
            'obj.created_at',
            'obj.currency',
            'obj.success',
        ];

        const payloadString = fields
            .map(path => {
                const parts = path.split('.');
                return parts.reduce((acc, key) => acc[key], body);
            })
            .join('');

        const calculated = this.generateHmac(payloadString, secretKey);

        return calculated === receivedHmac;
    }
}
