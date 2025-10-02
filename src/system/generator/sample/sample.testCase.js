// /**
//  * @jest-environment node
//  */
// import { jest } from '@jest/globals';
// import { BaseError } from '../src/system/core/error/baseError.js';

// /* ------------------------------------------------------------------------- */
// /* 1.  Create a fresh mocked service object for every test run               */
// /* ------------------------------------------------------------------------- */
// const mockRoleService = () => ({
//   findAllRoles: jest.fn(),
//   rolesList: jest.fn(),
//   roleStore: jest.fn(),
//   findOneRole: jest.fn(),
//   roleUpdate: jest.fn(),
//   roleCanDelete: jest.fn(),
//   roleDelete: jest.fn(),
// });

// /* ------------------------------------------------------------------------- */
// /* 2.  Mock the `role.service.js` module *before* importing the controller   */
// /* ------------------------------------------------------------------------- */
// jest.unstable_mockModule('../src/app/services/role.service.js', () => {
//   const service = mockRoleService();
//   return {
//     /* RolesController does `Role.getInstance('Role')`                       */
//     /* So we export getInstance that always hands back the same mock object */
//     getInstance: jest.fn(() => service),
//     /* Optional: allow tests to reach the current mock instance             */
//     __esModule: true,
//     default: service,
//   };
// });

// /* ------------------------------------------------------------------------- */
// /* 3.  Stub the i18n helper used inside BaseError (`__('...')`)              */
// /* ------------------------------------------------------------------------- */
// global.__ = (msg) => msg; // no-op translator

// /* ------------------------------------------------------------------------- */
// /* 4.  Import the controller AFTER the mocks are registered                  */
// /* ------------------------------------------------------------------------- */
// import RolesController from '../src/app/controllers/roles.controller.js';

// /* ------------------------------------------------------------------------- */
// /* 5.  Grab the service instance Jest returned from our manual mock          */
// /* ------------------------------------------------------------------------- */
// import RoleServiceMockModule from '../src/app/services/role.service.js';
// const roleService = RoleServiceMockModule.getInstance();

// /* ------------------------------------------------------------------------- */
// /* 6.  Helper: empty “transaction” object—we don’t use it in unit tests      */
// /* ------------------------------------------------------------------------- */
// const tx = { transaction: null };

// describe('RolesController', () => {
//   beforeEach(() => jest.clearAllMocks());

//   /* ---------------------------------------------------- */
//   /*  SUCCESS branch: rolesList                           */
//   /* ---------------------------------------------------- */
//   it('rolesList → returns list & 200 status', async () => {
//     const fakeRoles = [{ id: 1, name: 'Admin' }];
//     roleService.findAllRoles.mockResolvedValue(fakeRoles);

//     const result = await RolesController.rolesList({ query: {} }, tx);

//     expect(roleService.findAllRoles).toHaveBeenCalledWith({ query: {} }, tx);
//     expect(result).toEqual({
//       code: 200,
//       result: fakeRoles,
//       message: 'ROLES_LIST_FETCH_SUCESSFULLY',
//     });
//   });

//   /* ---------------------------------------------------- */
//   /*  ERROR branch: rolesList                             */
//   /* ---------------------------------------------------- */
//   it('rolesList → throws BaseError when service returns null', async () => {
//     roleService.findAllRoles.mockResolvedValue(null);

//     await expect(
//       RolesController.rolesList({ query: {} }, tx)
//     ).rejects.toBeInstanceOf(BaseError);
//   });

//   /* ---------------------------------------------------- */
//   /*  rolesDDLList                                        */
//   /* ---------------------------------------------------- */
//   it('rolesDDLList → adds return_type=ddl & returns data', async () => {
//     const fakeRoles = [{ id: 1, label: 'Admin' }];
//     roleService.rolesList.mockResolvedValue(fakeRoles);

//     const query = {};
//     const result = await RolesController.rolesDDLList({ query }, tx);

//     expect(query.return_type).toBe('ddl'); // mutated query
//     expect(roleService.rolesList).toHaveBeenCalledWith(query);
//     expect(result).toEqual({
//       code: 200,
//       result: fakeRoles,
//       message: 'Roles list for DDL got successfully.',
//     });
//   });

//   /* ---------------------------------------------------- */
//   /*  roleStore                                           */
//   /* ---------------------------------------------------- */
//   it('roleStore → creates role & returns 201', async () => {
//     const payload = {
//       parent: null,
//       name: 'Manager',
//       description: '',
//       resources: [],
//       status: true,
//     };
//     const created = { id: 42, ...payload };
//     roleService.roleStore.mockResolvedValue(created);

//     const result = await RolesController.roleStore({ body: payload }, tx);

//     expect(roleService.roleStore).toHaveBeenCalledWith(payload, tx);
//     expect(result).toEqual({
//       code: 201,
//       result: created,
//       message: 'New role created successfully.',
//     });
//   });

//   /* ---------------------------------------------------- */
//   /*  roleDetails (success & failure)                     */
//   /* ---------------------------------------------------- */
//   it('roleDetails → returns role info', async () => {
//     const role = { id: 7, name: 'Editor' };
//     roleService.findOneRole.mockResolvedValue(role);

//     const result = await RolesController.roleDetails({ params: { id: 7 } }, tx);

//     expect(roleService.findOneRole).toHaveBeenCalledWith(7, tx);
//     expect(result.code).toBe(201);
//   });

//   it('roleDetails → throws BaseError when not found', async () => {
//     roleService.findOneRole.mockResolvedValue(null);
//     await expect(
//       RolesController.roleDetails({ params: { id: 999 } }, tx)
//     ).rejects.toBeInstanceOf(BaseError);
//   });

//   /* ---------------------------------------------------- */
//   /*  roleUpdate                                          */
//   /* ---------------------------------------------------- */
//   it('roleUpdate → updates role & returns 200', async () => {
//     const updated = { id: 7, name: 'Editor 2' };
//     roleService.roleUpdate.mockResolvedValue(updated);

//     const body = {
//       parent: null,
//       name: 'Editor 2',
//       description: '',
//       resources: [],
//       status: true,
//     };
//     const result = await RolesController.roleUpdate(
//       { body, params: { id: 7 } },
//       tx
//     );

//     expect(roleService.roleUpdate).toHaveBeenCalledWith(7, body, tx);
//     expect(result.code).toBe(200);
//   });

//   /* ---------------------------------------------------- */
//   /*  roleCanDelete & roleDelete                          */
//   /* ---------------------------------------------------- */
//   describe('roleCanDelete / roleDelete', () => {
//     /*  These two methods rely on res.status(...).json(...) chains.          */
//     /*  To unit-test them we stub an Express-like response object.           */
//     const makeRes = () => {
//       const json = jest.fn();
//       const status = jest.fn(() => ({ json }));
//       return { status, json };
//     };

//     it('roleCanDelete → sends 200 JSON when deletable', async () => {
//       roleService.roleCanDelete.mockResolvedValue({ canDelete: true });

//       const res = makeRes();
//       await RolesController.roleCanDelete(
//         { params: { id: 5 } },
//         { transaction: null, res } // pass res in *second* arg bag
//       );

//       expect(roleService.roleCanDelete).toHaveBeenCalledWith(5);
//       expect(res.status).toHaveBeenCalledWith(200);
//       // `this.success` just wraps, so we check json called at all
//       expect(res.status().json).toHaveBeenCalled();
//     });

//     it('roleDelete → sends 200 JSON when deleted', async () => {
//       roleService.roleDelete.mockResolvedValue({ deleted: 1 });

//       const res = makeRes();
//       await RolesController.roleDelete(
//         { params: { id: 5 } },
//         { transaction: null, res }
//       );

//       expect(roleService.roleDelete).toHaveBeenCalledWith(5, tx);
//       expect(res.status).toHaveBeenCalledWith(200);
//       expect(res.status().json).toHaveBeenCalled();
//     });
//   });
// });
