import { cn, normalizeRole, getRoleHomePath } from '@/lib/utils';

describe('Utility Functions - Utils', () => {
    describe('cn (classname merge) function', () => {
        test('1. should merge tailwind classes', () => {
            const result = cn('px-2 py-1', 'px-4');
            expect(result).toBeTruthy();
            expect(typeof result).toBe('string');
        });

        test('2. should handle empty strings', () => {
            const result = cn('px-2', '', 'py-1');
            expect(result).toBeTruthy();
        });

        test('3. should override conflicting classes', () => {
            const result = cn('text-sm', 'text-lg');
            expect(result).toContain('text-lg');
        });

        test('4. should handle conditional merge', () => {
            const result = cn('base', true && 'active', false && 'inactive');
            expect(result).toContain('base');
            expect(result).toContain('active');
        });

        test('5. should handle complex class combinations', () => {
            const result = cn(
                'px-2 py-1',
                'bg-white',
                true && 'border-2',
                false && 'shadow-lg'
            );
            expect(result).toContain('px-2');
            expect(result).toContain('bg-white');
            expect(result).toContain('border-2');
        });
    });

    describe('normalizeRole function', () => {
        test('6. should normalize string roles to lowercase', () => {
            expect(normalizeRole('Admin')).toBe('admin');
            expect(normalizeRole('USER')).toBe('user');
            expect(normalizeRole('Seller')).toBe('seller');
        });

        test('7. should extract role from object with roleName', () => {
            const result = normalizeRole({ roleName: 'ADMIN' });
            expect(result).toBe('admin');
        });

        test('8. should extract role from object with role property', () => {
            const result = normalizeRole({ role: 'SELLER' });
            expect(result).toBe('seller');
        });

        test('9. should handle null or undefined input', () => {
            expect(normalizeRole(null)).toBeNull();
            expect(normalizeRole(undefined)).toBeNull();
        });

        test('10. should trim whitespace from role strings', () => {
            expect(normalizeRole('  admin  ')).toBe('admin');
        });
    });

    describe('getRoleHomePath function', () => {
        test('11. should return admin path for admin role', () => {
            const path = getRoleHomePath('admin');
            expect(path).toBe('/admin/users');
        });

        test('12. should return dashboard path for seller role', () => {
            const path = getRoleHomePath('seller');
            expect(path).toBe('/dashboard');
        });

        test('13. should return dashboard path for user role', () => {
            const path = getRoleHomePath('user');
            expect(path).toBe('/dashboard');
        });

        test('14. should return dashboard path as default', () => {
            const path = getRoleHomePath('unknown');
            expect(path).toBe('/dashboard');
        });

        test('15. should handle object roles', () => {
            const adminPath = getRoleHomePath({ roleName: 'admin' });
            expect(adminPath).toBe('/admin/users');
        });
    });
});
