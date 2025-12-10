import { gqlRequest } from "@/apis/config/apiClient";
import { User } from "@/types/api-response";

export interface LoginResponse {
  success: boolean;
  message: string;
  access_token?: string;
}

export interface SignUpResponse {
  success: boolean;
  message: string;
  user: User;
}

// LOGIN
export const signInApi = async (payload: {
  email: string;
  password: string;
}) => {
  const query = `
    mutation Login($email: String!, $password: String!) {
      login(loginInput: { email: $email, password: $password }) {
        success
        message
        access_token
      }
    }
  `;

  return gqlRequest<{ login: LoginResponse }>(query, payload).then(
    (d) => d.login
  );
};

// SIGNUP
export const signUpApi = async (payload: any) => {
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

  return gqlRequest<{ createUser: SignUpResponse }>(query, {
    createUserInput: payload,
  }).then((d) => d.createUser);
};

export const getProfileApi = async () => {
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

  return gqlRequest<{ profile: User }>(query).then((d) => d.profile);
};
