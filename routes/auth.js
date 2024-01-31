const express = require('express');

const authProvider = require('../auth/AuthProvider');
const { REDIRECT_URI, POST_LOGOUT_REDIRECT_URI } = require('../authConfig');

const router = express.Router();

router.get(
  '/signin',
  authProvider.login({
    scopes: [],
    redirectUri: REDIRECT_URI,
    successRedirect: '/home',
  })
);

router.get(
  '/acquireToken',
  authProvider.acquireToken({
    scopes: ['User.Read'],
    redirectUri: REDIRECT_URI,
    successRedirect: '/user/profile',
  })
);

router.post('/redirect', authProvider.handleRedirect());

router.get(
  '/signout',
  authProvider.logout({
    postLogoutRedirectUri: POST_LOGOUT_REDIRECT_URI,
  })
);

module.exports = router;
