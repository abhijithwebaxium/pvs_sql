import { Client } from 'ldapts';

/**
 * Authenticate user against LDAP server
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} - Returns user info if successful
 */
export const authenticateLDAP = async (email, password) => {
  // LDAP Configuration from environment variables
  const ldapServer = process.env.HRPORTAL_LDAP_Server;
  const baseDN = process.env.HRPORTAL_LDAP_BaseDN;
  const adminUser = process.env.HRPORTAL_LDAP_User;
  const adminPassword = process.env.HRPORTAL_LDAP_PW;

  // Validate environment variables
  if (!ldapServer || !baseDN || !adminUser || !adminPassword) {
    throw new Error('LDAP configuration is missing in environment variables');
  }

  const client = new Client({
    url: ldapServer,
    timeout: 5000, // Reduced to 5 seconds
    connectTimeout: 5000,
  });

  try {
    // Step 1: Bind with admin credentials to search for the user
    console.log('=== LDAP Authentication Start ===');
    console.log('LDAP Server:', ldapServer);
    console.log('Base DN:', baseDN);

    await client.bind(adminUser, adminPassword);
    console.log('Admin bind successful');

    // Step 2: Search for user by email
    // Extract username from email (e.g., testuser3@lab.local -> testuser3)
    const username = email.split('@')[0];

    // Try multiple search filters for better compatibility
    // Active Directory commonly uses userPrincipalName, mail, or sAMAccountName
    const searchFilter = `(|(userPrincipalName=${email})(mail=${email})(sAMAccountName=${username}))`;

    console.log('=== LDAP Search ===');
    console.log('Search Filter:', searchFilter);
    console.log('Email:', email);
    console.log('Username:', username);

    const searchOptions = {
      filter: searchFilter,
      scope: 'sub',
      attributes: ['dn', 'cn', 'mail', 'userPrincipalName', 'sAMAccountName', 'displayName', 'givenName', 'sn'],
    };

    const { searchEntries } = await client.search(baseDN, searchOptions);

    console.log('=== LDAP Search Results ===');
    console.log('Entries found:', searchEntries.length);

    if (searchEntries.length === 0) {
      await client.unbind();
      throw new Error('User not found in LDAP directory. Please check your email address.');
    }

    const userEntry = searchEntries[0];
    const userDN = userEntry.dn;

    console.log('=== Found User ===');
    console.log('User DN:', userDN);
    console.log('User Attributes:', userEntry);

    // Extract user info
    const userInfo = {
      dn: userDN,
      email: userEntry.mail || userEntry.userPrincipalName || email,
      displayName: userEntry.displayName || userEntry.cn,
      firstName: userEntry.givenName || '',
      lastName: userEntry.sn || '',
      username: userEntry.sAMAccountName || username,
    };

    // Unbind admin connection
    await client.unbind();

    // Step 3: Try to bind with user's credentials to verify password
    console.log('=== Verifying User Password ===');
    const userClient = new Client({
      url: ldapServer,
      timeout: 5000, // Reduced to 5 seconds
      connectTimeout: 5000,
    });

    try {
      await userClient.bind(userDN, password);
      console.log('User authentication successful');
      await userClient.unbind();

      return {
        success: true,
        user: userInfo,
      };
    } catch (bindError) {
      console.error('User bind error:', bindError.message);
      await userClient.unbind();
      throw new Error('Invalid LDAP credentials');
    }
  } catch (error) {
    console.error('LDAP Auth Error:', error.message);
    try {
      await client.unbind();
    } catch (unbindError) {
      // Ignore unbind errors
    }
    throw error;
  }
};

/**
 * Test LDAP connection
 * @returns {Promise<boolean>}
 */
export const testLDAPConnection = async () => {
  const ldapServer = process.env.HRPORTAL_LDAP_Server;
  const adminUser = process.env.HRPORTAL_LDAP_User;
  const adminPassword = process.env.HRPORTAL_LDAP_PW;

  if (!ldapServer || !adminUser || !adminPassword) {
    throw new Error('LDAP configuration is missing');
  }

  const client = new Client({
    url: ldapServer,
    timeout: 5000,
    connectTimeout: 5000,
  });

  try {
    await client.bind(adminUser, adminPassword);
    await client.unbind();
    return true;
  } catch (error) {
    try {
      await client.unbind();
    } catch (unbindError) {
      // Ignore unbind errors
    }
    throw error;
  }
};
