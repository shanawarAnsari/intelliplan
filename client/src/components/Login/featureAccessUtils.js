export const checkRunRateAccess = (user) => {
    if (!user) return false;

    const requiredGroups = ['KC_INTELLIPLAN_USERS_ACCESS_RUNRATE'];

    const hasRunRateAccess = user.mygroup?.some((group) =>
        requiredGroups.includes(group)
    );
    return !!hasRunRateAccess;
};

export const checkAskIntelliplanAccess = (user) => {
    if (!user) return false;

    const requiredGroups = ['KC_INTELLIPLAN_USERS_ACCESS_ASK_INTELLIPLAN'];

    const hasAskIntelliplanAccess = user.mygroup?.some((group) =>
        requiredGroups.includes(group)
    );
    return !!hasAskIntelliplanAccess;
};