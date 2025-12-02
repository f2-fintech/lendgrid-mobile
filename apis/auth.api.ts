import { gqlRequest } from "./apiClient";

/**
 * User login - EXACT same as web app
 */
export function signInApi(payload: { email: string; password: string }) {
  const query = `
    mutation Login($email: String!, $password: String!) {
      login(loginInput: { email: $email, password: $password }) {
        success
        message
        access_token
      }
    }
  `;

  return gqlRequest(query, payload).then((d) => d.login);
}

/**
 * User registration - EXACT same as web app
 */
export function signUpApi(payload: any) {
  const query = `
    mutation CreateUser($createUserInput: CreateUserDto!) {
      createUser(createUserInput: $createUserInput) {
        success
        message
        user {
          _id
          username
          email
          role
        }
      }
    }
  `;

  return gqlRequest(query, { createUserInput: payload }).then(
    (d) => d.createUser
  );
}

/**
 * Get current user profile - EXACT same as web app
 */
export function getProfileApi() {
  const query = `
    query Profile {
      profile {
        _id
        profileId
        username
        email
        role
        status
        contact
        photoUrl
      }
    }
  `;

  return gqlRequest(query).then((d) => d.profile);
}
