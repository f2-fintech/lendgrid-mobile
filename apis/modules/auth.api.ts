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

/**
 *  LOGIN
 * Now requires captchaToken (Cloudflare Turnstile token)
 */
export const signInApi = async (payload: {
  email: string;
  password: string;
  captchaToken: string;
}) => {
  const query = `
    mutation Login($email: String!, $password: String!, $captchaToken: String!) {
      login(loginInput: { email: $email, password: $password, captchaToken: $captchaToken }) {
        success
        message
        access_token
      }
    }
  `;

  return gqlRequest<{ login: LoginResponse }>(query, payload).then(
    (d) => d.login,
  );
};

/**
 *  SIGNUP
 * We are passing captchaToken inside createUserInput.
 * (This assumes CreateUserDto includes captchaToken in backend.)
 */
export const signUpApi = async (payload: any & { captchaToken: string }) => {
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

export const getReferralCodeApi = async () => {
  const inviteLinkQuery = `
    query MyReferralInviteLink($source: String) {
      myReferralInviteLink(source: $source) {
        referralCode
        companyName
        onboardingLink
        source
      }
    }
  `;

  try {
    return await gqlRequest<{
      myReferralInviteLink: {
        referralCode?: string | null;
        companyName?: string | null;
        onboardingLink?: string | null;
        source?: string | null;
      };
    }>(inviteLinkQuery, { source: "mobile" }).then(
      (d) => d.myReferralInviteLink,
    );
  } catch {
    const profileQuery = `
      query Profile {
        profile {
          profileId
        }
      }
    `;

    const profile = await gqlRequest<{
      profile: { profileId?: string | null };
    }>(profileQuery).then((d) => d.profile);

    if (!profile?.profileId) {
      throw new Error("Aggregator profile not found for current user");
    }

    const referralQuery = `
      query FindOneAggregatorReferral($id: ID!) {
        findOneAggregatorProfile(id: $id) {
          referralCode
          companyName
        }
      }
    `;

    return gqlRequest<{
      findOneAggregatorProfile: {
        referralCode?: string | null;
        companyName?: string | null;
      };
    }>(referralQuery, { id: profile.profileId }).then(
      (d) => d.findOneAggregatorProfile,
    );
  }
};

export const updateUserApi = async (payload: {
  id: string;
  username?: string;
  email?: string;
  contact?: string;
  photoUrl?: string | null;
  status?: string;
}) => {
  const query = `
    mutation UpdateUser($updateUserInput: UpdateUserDto!) {
      updateUser(updateUserInput: $updateUserInput) {
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

  return gqlRequest<{ updateUser: User }>(query, {
    updateUserInput: payload,
  }).then((d) => d.updateUser);
};

//  USERS BY ROLE
export const findUsersByRoleApi = async (
  role: string,
  params?: { page?: number; limit?: number },
) => {
  const query = `
    query UsersByRole($role: Role!, $page: Int, $limit: Int) {
      usersByRole(role: $role, paginationArgs: { page: $page, limit: $limit }) {
        results {
          _id
          username
          email
          status
          role
          createdAt
          loginHistory
        }
        count
        page
        pages
      }
    }
  `;

  return gqlRequest<{ usersByRole: any }>(query, {
    role,
    page: params?.page,
    limit: params?.limit,
  }).then((d) => d.usersByRole);
};

// GET USERS (PAGINATED)
export const getUsersApi = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  const query = `
    query Users($page: Int, $limit: Int, $status: String) {
      users(paginationArgs: { page: $page, limit: $limit, status: $status }) {
        results {
          _id
          username
          email
          role
          status
        }
        count
        pages
      }
    }
  `;

  return gqlRequest<{ users: any }>(query, params || {}).then((d) => d.users);
};

//  REMOVE USER
export const removeUserApi = async (id: string) => {
  const query = `
    mutation RemoveUser($id: ID!) {
      removeUser(id: $id) {
        _id
        username
        status
      }
    }
  `;
  return gqlRequest<{ removeUser: any }>(query, { id }).then(
    (d) => d.removeUser,
  );
};

// forgot password
export const forgotPasswordApi = async (email: string) => {
  const query = `
    mutation ForgotPassword($email: String!) {
      forgotPassword(email: $email)
    }
  `;
  // Using your existing gqlRequest helper
  return gqlRequest<{ forgotPassword: boolean }>(query, { email }).then(
    (d) => d.forgotPassword,
  );
};

/**
 * SAVE PUSH TOKEN
 * Sends the Expo Push Token to the backend to enable mobile notifications
 */
export const updatePushTokenApi = async (token: string) => {
  const query = `
    mutation UpdatePushToken($token: String!) {
      updatePushToken(token: $token) {
        success
        message
      }
    }
  `;

  return gqlRequest<{ updatePushToken: { success: boolean; message: string } }>(
    query,
    { token },
  ).then((d) => d.updatePushToken);
};

/**
 * CLEAR PUSH TOKEN
 * Removes this device from the currently authenticated user so Expo push
 * notifications stop after logout or account switching.
 */
export const clearPushTokenApi = async () => {
  const mutationAttempts = [
    {
      query: `
        mutation ClearPushTokenByEmptyValue($token: String!) {
          updatePushToken(token: $token) {
            success
            message
          }
        }
      `,
      variables: { token: "" },
      pick: (data: any) => data.updatePushToken,
    },
    {
      query: `
        mutation ClearPushToken {
          clearPushToken {
            success
            message
          }
        }
      `,
      variables: {},
      pick: (data: any) => data.clearPushToken,
    },
    {
      query: `
        mutation RemovePushToken {
          removePushToken {
            success
            message
          }
        }
      `,
      variables: {},
      pick: (data: any) => data.removePushToken,
    },
    {
      query: `
        mutation DeletePushToken {
          deletePushToken {
            success
            message
          }
        }
      `,
      variables: {},
      pick: (data: any) => data.deletePushToken,
    },
  ];

  let lastError: unknown;

  for (const attempt of mutationAttempts) {
    try {
      const data = await gqlRequest<any>(attempt.query, attempt.variables);
      const result = attempt.pick(data);
      if (result?.success === false) {
        throw new Error(result?.message || "Push token clear failed");
      }
      return result;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};

export const registerUserApi = async (payload: {
  username: string;
  email: string;
  contact: string;
  password?: string;
  role: string;
  parentAggregatorId?: string;
}) => {
  const query = `
    mutation CreateUser($createUserInput: CreateUserDto!) {
      createUser(createUserInput: $createUserInput) {
        success
        message
        companyId
        companyName
        user {
          _id
          username
          email
          role
        }
      }
    }
  `;

  return gqlRequest<{
    createUser: {
      success: boolean;
      message: string;
      companyId?: string;
      companyName?: string;
      user?: {
        _id: string;
        username: string;
        email: string;
        role: string;
      };
    };
  }>(query, {
    createUserInput: {
      ...payload,
      role: payload.role ? payload.role.toUpperCase() : undefined,
    },
  }).then((d) => d.createUser);
};
