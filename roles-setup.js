require('dotenv').config();

const auth = require('./src/auth');
const broadcast = require('./src/broadcast');
const acc1 = process.env.ROLE_CREATOR_ACCOUNT;
const pass1 = process.env.ROLE_CREATOR_PASSWORD;

const ROLES_SETUP = {
  /* EXAMPLE
  // ROLE_CREATOR is the account mentioned in ROLE_CREATOR_ACCOUNT env variable
  'ROLE_NAME': {
    'maintainers': [],
    'allowed_ops': [], // take the ids of ops from src/auth/serializer/src/operations.js (at the end of the file take a look at operation.st_operations arr)
    'denied_ops': [],
  }
   */

  // There is no need in NO_LEVEL role because accounts without roles can broadcast anything
  // 'NO_LEVEL'    : {
  //   'maintainers'   : [],
  //   'allowed_ops': [],
  //   'denied_ops' : [],
  // },
  'level0'    : {         // no allowed/denied ops means everything is denied
    'maintainers'   : [],
    'allowed_ops': [],
    'denied_ops' : [],
  },
  'level1': {
    'maintainers'   : [],
    'allowed_ops': [2], // only transfer allowed
    'denied_ops' : [],
  },
  'level2': {
    'maintainers'   : [],
    'allowed_ops': [1, 2], // comment & transfer (comment === post creation, from tech perspective, the first comment in non-existing post is a post creation)
    'denied_ops' : [],
  },
  'level3': {
    'maintainers'   : [],
    'allowed_ops': [0, 1, 2], // vote, comment, transfer
    'denied_ops' : [],
  },
}

if (acc1 === undefined || pass1 === undefined || acc1 === '' || pass1 === '') {
  throw new Error('Please set ROLE_CREATOR_ACCOUNT and ROLE_CREATOR_PASSWORD environment variables');
}

const wif = auth.toWif(acc1, pass1, 'active');

if (process.argv.length === 3 && process.argv[2] === 'create') {
  create();
} else if (process.argv.length === 3 && process.argv[2] === 'destroy') {
  destroy();
}

function create() {

  Object.keys(ROLES_SETUP).forEach(async (roleName) => {
    const role = {
      name       : roleName,
      maintainers   : ROLES_SETUP[roleName].maintainers,
      allowed_ops: ROLES_SETUP[roleName].allowed_ops,
      denied_ops : ROLES_SETUP[roleName].denied_ops,
    }

    let response;

    try {
      response = await broadcast.roleCreateAsync(wif, acc1, roleName, role.maintainers, role.allowed_ops, role.denied_ops, []);
    } catch (e) {
      console.log("\x1b[31m", `Cannot create role ${roleName}: ${e.message}`, '\x1b[0m');
    }

    if (response !== undefined && response.id) {
      console.log("\x1b[32m", `Role ${roleName} created successfully`, '\x1b[0m');
    }

  });

}

function destroy() {
  Object.keys(ROLES_SETUP).forEach(async (roleName) => {
    let response;

    try {
      response = await broadcast.roleDeleteAsync(wif, acc1, roleName, []);
    } catch (e) {
      console.log("\x1b[31m", `Cannot delete role ${roleName}: ${e.message}. Skipping...`, '\x1b[0m');
    }

    if (response !== undefined && response.id) {
      console.log("\x1b[32m", `Role ${roleName} deleted successfully`, '\x1b[0m');
    }

  });
}
