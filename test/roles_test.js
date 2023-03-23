require('dotenv').config();

const assert = require('assert');
const auth = require('../src/auth');
const broadcast = require('../src/broadcast');
const steem = require('../src');


describe("steem.roles: Testing roles operations", async () => {

  const ref_block_num = 34294;
  const ref_block_prefix = 3707022213;
  const expiration = "2016-04-06T08:29:27";

  const TEST_ROLE_NAME = process.env.ROLE_TEST_NAME;

  const acc1 = process.env.ROLE_CREATOR_ACCOUNT;
  const pass1 = process.env.ROLE_CREATOR_PASSWORD;


  const acc2 = process.env.ROLE_TEST_ACCOUNT;

  const wif = auth.toWif(acc1, pass1, 'active');

  describe('Testing roles transactions formats are correct', async () => {

    it('role_create transaction hexes match', async () => {
      let tx = {
        "ref_block_num"   : ref_block_num,
        "ref_block_prefix": ref_block_prefix,
        "expiration"      : expiration,
        "operations"      : [['role_create', {
          "account"           : "serey",
          "role_name"         : "testrole",
          "maintainers"       : ["serey"],
          "allowed_operations": [1],
          "denied_operations" : [1],
        }]],
        "extensions"      : [],
        "signatures"      : []
      }

      const compare = 'f68585abf4dce7c8045701320573657265790874657374726f6c6501057365726579010100000000000000010100000000000000000000';

      const response = await steem.api.getTransactionHexAsync(tx);

      assert.equal(response.slice(0, -130), compare.slice(0, -130))
    });

    it('role_update transaction hexes match', async () => {
      let tx = {
        "ref_block_num"   : ref_block_num,
        "ref_block_prefix": ref_block_prefix,
        "expiration"      : expiration,
        "operations"      : [['role_update', {
          "account"               : "serey",
          "role_name"             : "testrole",
          "new_role_name"         : "newtestrole",
          "new_maintainers"       : ["serey", "alice"],
          "new_allowed_operations": [1, 2],
          "new_denied_operations" : [1, 3],
        }]],
        "extensions"      : [],
        "signatures"      : []
      }

      const compare = 'f68585abf4dce7c8045701330573657265790874657374726f6c65010b6e657774657374726f6c65010205616c696365057365726579010201000000000000000200000000000000010201000000000000000300000000000000000000';

      const response = await steem.api.getTransactionHexAsync(tx);

      assert.equal(response.slice(0, -130), compare.slice(0, -130))
    });

    it('role_delete transaction hexes match', async () => {
      let tx = {
        "ref_block_num"   : ref_block_num,
        "ref_block_prefix": ref_block_prefix,
        "expiration"      : expiration,
        "operations"      : [['role_delete', {
          "account"  : "serey",
          "role_name": "newtestrole",
        }]],
        "extensions"      : [],
        "signatures"      : []
      }

      const compare = 'f68585abf4dce7c8045701340573657265790b6e657774657374726f6c65000000';

      const response = await steem.api.getTransactionHexAsync(tx);
      assert.equal(response.slice(0, -130), compare.slice(0, -130))
    });

    it('role_apply transaction hexes match', async () => {
      let tx = {
        "ref_block_num"   : ref_block_num,
        "ref_block_prefix": ref_block_prefix,
        "expiration"      : expiration,
        "operations"      : [['role_apply', {
          "maintainer"   : "serey",
          "account"      : "alice",
          "role_to_grant": "newtestrole",
        }]],
        "extensions"      : [],
        "signatures"      : []
      }

      const compare = 'f68585abf4dce7c80457013505736572657905616c696365010b6e657774657374726f6c6500000000';

      const response = await steem.api.getTransactionHexAsync(tx);
      assert.equal(response.slice(0, -130), compare.slice(0, -130))
    });

  })

  describe('Testing roles transactions broadcast', async () => {
    describe('Broadcast role_create', async () => {
      it(`Should create ${TEST_ROLE_NAME}`, async () => {
        let response

        try {
          response = await broadcast.roleCreateAsync(wif, acc1, TEST_ROLE_NAME, [acc1], [1], [], []);
        } catch (e) {
          assert.fail('Request failed');
        }

        assert.ok(response.id)
      });
    });

    describe('Broadcast role_update', async () => {
      it('Should update serey_test_role perms', async () => {
        let response

        try {
          response = await broadcast.roleUpdateAsync(wif, acc1, TEST_ROLE_NAME, TEST_ROLE_NAME, [acc1], [1, 2], [], []);
        } catch (e) {
          assert.fail('Request failed');
        }

        assert.ok(response.id)
      });
    });

    describe('Broadcast role_apply', async () => {
      it('Should grant account to role serey_test_role', async () => {
        let response

        try {
          response = await broadcast.roleApplyAsync(wif, acc1, acc2, TEST_ROLE_NAME, undefined, []);
        } catch (e) {
          assert.fail('Request failed');
        }

        assert.ok(response.id)
      });

      it('Should revoke serey_test_role role from account', async () => {
        let response

        try {
          response = await broadcast.roleApplyAsync(wif, acc1, acc2, undefined, TEST_ROLE_NAME, []);
        } catch (e) {
          assert.fail('Request failed');
        }

        assert.ok(response.id)
      });
    });

    describe('Broadcast role_delete', async () => {
      it('Should delete serey_test_role', async () => {
        let response

        try {
          response = await broadcast.roleDeleteAsync(wif, acc1, TEST_ROLE_NAME, []);
        } catch (e) {
          assert.fail('Request failed');
        }

        assert.ok(response.id)
      });
    });
  });

})
