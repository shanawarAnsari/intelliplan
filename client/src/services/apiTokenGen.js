import { getApi, postApi } from './common';

export const generateApiToken = async (authToken, mygroup, myrole) => {
  const response = await postApi('auth/generateApiToken', {
    accessToken: authToken,   //can be either access_token or id_token based on availability
    myGroup: mygroup,
    myRole: myrole
  });
  return response;
};

export const generateAgentApiToken = async () => {
  const response = await getApi('genAgentToken/generate');
  return response;
};

