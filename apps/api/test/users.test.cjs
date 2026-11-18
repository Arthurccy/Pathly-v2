require('reflect-metadata');
const assert = require('node:assert/strict');
const test = require('node:test');
const { Test } = require('@nestjs/testing');
const { ValidationPipe } = require('@nestjs/common');
const { Prisma } = require('@pathly/database');
const { SupabaseAuthGuard } = require('../src/common/guards/supabase-auth.guard');
const { AccountsController } = require('../src/modules/accounts/accounts.controller');
const { AccountsService } = require('../src/modules/accounts/accounts.service');
const { UsersController } = require('../src/modules/users/users.controller');
const { PROFILE_REPOSITORY, UsersService } = require('../src/modules/users/users.service');

const createdAt = new Date('2026-10-01T10:00:00.000Z');

function createRepository() {
  const profiles = new Map();
  return {
    profiles,
    async findUnique({ where }) {
      if (where.id) return profiles.get(where.id) ?? null;
      return [...profiles.values()].find((profile) => profile.email === where.email) ?? null;
    },
    async create({ data }) {
      if ([...profiles.values()].some((profile) => profile.email === data.email || profile.id === data.id)) {
        throw new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002',
          clientVersion: 'test',
        });
      }
      const profile = { ...data, fullName: null, createdAt, updatedAt: createdAt };
      profiles.set(profile.id, profile);
      return profile;
    },
    async update({ where, data }) {
      const profile = profiles.get(where.id);
      if (!profile) throw new Error('Profil introuvable');
      Object.assign(profile, data);
      return profile;
    },
  };
}

test('GET /me crée un profil avec l’identité validée puis le conserve', async () => {
  const repository = createRepository();
  const service = new UsersService(repository);
  const expected = {
    id: 'user-a', email: 'a@example.test', fullName: null, createdAt: createdAt.toISOString(),
  };
  assert.deepEqual(await service.getOrCreateProfile({ id: 'user-a', email: 'a@example.test' }), expected);
  assert.deepEqual(await service.getOrCreateProfile({ id: 'user-a', email: 'new@example.test' }), expected);
  assert.equal(repository.profiles.size, 1);
});

test('un e-mail déjà associé à un autre profil provoque une erreur 409 explicite', async () => {
  const repository = createRepository();
  const service = new UsersService(repository);
  await service.getOrCreateProfile({ id: 'user-a', email: 'a@example.test' });
  await assert.rejects(
    service.getOrCreateProfile({ id: 'user-b', email: 'a@example.test' }),
    (error) => error.getStatus() === 409
      && error.getResponse().error.code === 'PROFILE_EMAIL_CONFLICT',
  );
  assert.equal(repository.profiles.size, 1);
});

test('un profil absent sans e-mail est refusé sans écriture', async () => {
  const repository = createRepository();
  const service = new UsersService(repository);
  await assert.rejects(
    service.getOrCreateProfile({ id: 'user-a' }),
    (error) => error.getStatus() === 422
      && error.getResponse().error.code === 'PROFILE_EMAIL_REQUIRED',
  );
  assert.equal(repository.profiles.size, 0);
});

test('une création concurrente du même profil retrouve le profil existant', async () => {
  const repository = createRepository();
  const originalCreate = repository.create;
  repository.create = async (input) => {
    await originalCreate(input);
    throw new Prisma.PrismaClientKnownRequestError('Unique constraint', {
      code: 'P2002',
      clientVersion: 'test',
    });
  };
  const service = new UsersService(repository);
  const result = await service.getOrCreateProfile({ id: 'user-a', email: 'a@example.test' });
  assert.equal(result.id, 'user-a');
  assert.equal(repository.profiles.size, 1);
});

test('une erreur de stockage non liée à une contrainte unique est propagée', async () => {
  const repository = createRepository();
  const failure = new Error('Dépôt indisponible');
  repository.create = async () => { throw failure; };
  await assert.rejects(
    new UsersService(repository).getOrCreateProfile({ id: 'user-a', email: 'a@example.test' }),
    (error) => error === failure,
  );
});

test('GET /me sans session retourne 401 avant tout accès au dépôt', async () => {
  const repository = {
    findUnique: async () => { throw new Error('Dépôt appelé sans session'); },
    create: async () => { throw new Error('Dépôt appelé sans session'); },
  };
  const module = await Test.createTestingModule({
    controllers: [UsersController],
    providers: [UsersService, { provide: PROFILE_REPOSITORY, useValue: repository }],
  }).compile();
  const app = module.createNestApplication();
  await app.listen(0, '127.0.0.1');
  try {
    const address = app.getHttpServer().address();
    const response = await fetch(`http://127.0.0.1:${address.port}/me`);
    assert.equal(response.status, 401);
    const body = await response.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'HTTP_401');
  } finally {
    await app.close();
  }
});

test('GET /accounts sans session est refusé avant toute lecture de comptes', async () => {
  const module = await Test.createTestingModule({
    controllers: [AccountsController],
    providers: [{
      provide: AccountsService,
      useValue: { getAccountsByUser: () => { throw new Error('Dépôt appelé sans session'); } },
    }],
  }).compile();
  const app = module.createNestApplication();
  await app.listen(0, '127.0.0.1');
  try {
    const address = app.getHttpServer().address();
    const response = await fetch(`http://127.0.0.1:${address.port}/accounts`);
    assert.equal(response.status, 401);
  } finally {
    await app.close();
  }
});

test('PATCH /me valide la saisie et ne modifie que le profil authentifié', async () => {
  const repository = createRepository();
  const service = new UsersService(repository);
  await service.getOrCreateProfile({ id: 'user-b', email: 'b@example.test' });
  const module = await Test.createTestingModule({
    controllers: [UsersController],
    providers: [UsersService, { provide: PROFILE_REPOSITORY, useValue: repository }],
  })
    .overrideGuard(SupabaseAuthGuard)
    .useValue({
      canActivate(context) {
        const request = context.switchToHttp().getRequest();
        request.user = request.headers.authorization === 'Bearer conflict'
          ? { id: 'user-c', email: 'b@example.test' }
          : { id: 'user-a', email: 'a@example.test' };
        return true;
      },
    })
    .compile();
  const app = module.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  await app.listen(0, '127.0.0.1');
  try {
    const address = app.getHttpServer().address();
    const url = `http://127.0.0.1:${address.port}/me`;
    const patch = (body) => fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const invalid = await patch({ fullName: '  ' });
    assert.equal(invalid.status, 400);
    assert.equal((await invalid.json()).success, false);
    assert.equal((await patch({ fullName: null })).status, 400);
    assert.equal((await patch({ fullName: 'Nom', id: 'user-b' })).status, 400);
    const valid = await patch({ fullName: '  Alice Test  ' });
    assert.equal(valid.status, 200);
    assert.equal(valid.headers.get('cache-control'), 'no-store');
    const body = await valid.json();
    assert.equal(body.data.id, 'user-a');
    assert.equal(body.data.fullName, 'Alice Test');
    assert.equal(repository.profiles.get('user-b').fullName, null);
    const conflict = await fetch(url, { headers: { Authorization: 'Bearer conflict' } });
    assert.equal(conflict.status, 409);
    assert.equal((await conflict.json()).error.code, 'PROFILE_EMAIL_CONFLICT');
  } finally {
    await app.close();
  }
});
