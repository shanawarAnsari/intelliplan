import { getApi } from "./common";
export const getRunRate = async () => {
    debugger;
    return getApi(`runRate/getRunRateData`)
        .then((data) => data)
        .catch((error) => error);
};