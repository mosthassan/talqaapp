import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { verifyAdminRequest } from './adminAuth';
import * as firebaseAdmin from './firebaseAdmin';
import { POST as bootstrapHandler, resetTestOwnerRecordForTesting } from '@/app/api/admin/bootstrap/route';

let mockAuthInstance: any = null;
let mockFirestoreInstance: any = null;

vi.mock('@/src/lib/server/firebaseAdmin', () => ({
  getAdminAuth: () => mockAuthInstance,
  getAdminFirestore: () => mockFirestoreInstance,
  getAdminApp: () => (mockAuthInstance ? {} : null),
}));

describe('Admin Authentication & Authorization Security', () => {
  beforeEach(() => {
    mockAuthInstance = null;
    mockFirestoreInstance = null;
    resetTestOwnerRecordForTesting();
  });

  it('rejects requests without Authorization Bearer header (401)', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/test');
    const res = await verifyAdminRequest(req);
    expect(res.isAdmin).toBe(false);
    expect(res.statusCode).toBe(401);
    expect(res.error).toContain('رمز التوثيق');
  });

  it('rejects requests with empty Bearer token (401)', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/test', {
      headers: { authorization: 'Bearer   ' },
    });
    const res = await verifyAdminRequest(req);
    expect(res.isAdmin).toBe(false);
    expect(res.statusCode).toBe(401);
  });

  it('fails closed (503) if Firebase Admin SDK is not initialized', async () => {
    mockAuthInstance = null;

    const req = new NextRequest('http://localhost:3000/api/admin/test', {
      headers: { authorization: 'Bearer some_token_xyz' },
    });
    const res = await verifyAdminRequest(req);
    expect(res.isAdmin).toBe(false);
    expect(res.statusCode).toBe(503);
    expect(res.error).toContain('غير متوفرة');
  });

  it('rejects invalid or expired token (401)', async () => {
    mockAuthInstance = {
      verifyIdToken: vi.fn().mockRejectedValue(new Error('Firebase ID token has expired')),
    };

    const req = new NextRequest('http://localhost:3000/api/admin/test', {
      headers: { authorization: 'Bearer expired_token' },
    });
    const res = await verifyAdminRequest(req);
    expect(res.isAdmin).toBe(false);
    expect(res.statusCode).toBe(401);
    expect(res.error).toContain('منتهي الصلاحية');
  });

  it('rejects regular Google user without custom admin claim (403)', async () => {
    mockAuthInstance = {
      verifyIdToken: vi.fn().mockResolvedValue({
        uid: 'regular_user_123',
        email: 'regular.subscriber@gmail.com',
        email_verified: true,
        admin: false, // NO ADMIN CLAIM
      }),
    };

    const req = new NextRequest('http://localhost:3000/api/admin/test', {
      headers: { authorization: 'Bearer valid_regular_user_token' },
    });
    const res = await verifyAdminRequest(req);
    expect(res.isAdmin).toBe(false);
    expect(res.statusCode).toBe(403);
    expect(res.error).toContain('ليس لديه صلاحيات الإشراف');
  });

  it('authorizes user with verified custom claim admin: true', async () => {
    mockAuthInstance = {
      verifyIdToken: vi.fn().mockResolvedValue({
        uid: 'owner_uid_789',
        email: 'network.owner@gmail.com',
        email_verified: true,
        admin: true, // VERIFIED ADMIN CLAIM
        role: 'owner',
      }),
    };

    const req = new NextRequest('http://localhost:3000/api/admin/test', {
      headers: { authorization: 'Bearer valid_owner_token' },
    });
    const res = await verifyAdminRequest(req);
    expect(res.isAdmin).toBe(true);
    expect(res.uid).toBe('owner_uid_789');
    expect(res.email).toBe('network.owner@gmail.com');
  });
});

describe('Owner Bootstrap Flow (/api/admin/bootstrap)', () => {
  beforeEach(() => {
    mockAuthInstance = null;
    mockFirestoreInstance = null;
    resetTestOwnerRecordForTesting();
  });

  it('allows the first verified Google user to claim Owner role and sets custom claim', async () => {
    const setCustomUserClaimsMock = vi.fn().mockResolvedValue(undefined);
    mockAuthInstance = {
      verifyIdToken: vi.fn().mockResolvedValue({
        uid: 'first_owner_uid',
        email: 'first.owner@gmail.com',
        email_verified: true,
        firebase: { sign_in_provider: 'google.com' },
      }),
      setCustomUserClaims: setCustomUserClaimsMock,
    };

    const req = new NextRequest('http://localhost:3000/api/admin/bootstrap', {
      method: 'POST',
      headers: { authorization: 'Bearer valid_first_user_token' },
    });

    const res = await bootstrapHandler(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.isOwner).toBe(true);
    expect(setCustomUserClaimsMock).toHaveBeenCalledWith('first_owner_uid', {
      admin: true,
      role: 'owner',
    });
  });

  it('rejects a second bootstrap attempt with 409 Conflict', async () => {
    mockAuthInstance = {
      verifyIdToken: vi.fn().mockResolvedValue({
        uid: 'user_uid',
        email: 'user@gmail.com',
        email_verified: true,
        firebase: { sign_in_provider: 'google.com' },
      }),
      setCustomUserClaims: vi.fn().mockResolvedValue(undefined),
    };

    // 1. First claim succeeds
    const req1 = new NextRequest('http://localhost:3000/api/admin/bootstrap', {
      method: 'POST',
      headers: { authorization: 'Bearer first_token' },
    });
    const res1 = await bootstrapHandler(req1);
    expect(res1.status).toBe(200);

    // 2. Second claim must be rejected (409)
    const req2 = new NextRequest('http://localhost:3000/api/admin/bootstrap', {
      method: 'POST',
      headers: { authorization: 'Bearer second_token' },
    });
    const res2 = await bootstrapHandler(req2);
    expect(res2.status).toBe(409);

    const data2 = await res2.json();
    expect(data2.success).toBe(false);
    expect(data2.error).toContain('مسبقاً');
  });

  it('rejects bootstrap if email is unverified (400)', async () => {
    mockAuthInstance = {
      verifyIdToken: vi.fn().mockResolvedValue({
        uid: 'unverified_uid',
        email: 'unverified@gmail.com',
        email_verified: false, // UNVERIFIED
        firebase: { sign_in_provider: 'google.com' },
      }),
    };

    const req = new NextRequest('http://localhost:3000/api/admin/bootstrap', {
      method: 'POST',
      headers: { authorization: 'Bearer token' },
    });

    const res = await bootstrapHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('موثقاً');
  });
});
