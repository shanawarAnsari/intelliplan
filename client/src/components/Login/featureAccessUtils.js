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

export const checkDemandPlanningAccess = (user) => {
    if (!user) return false;

    const requiredGroups = ['KC_INTELLIPLAN_USERS_DEMAND_PLANNING'];

    const hasDemandPlanningAccess = user.mygroup?.some((group) =>
        requiredGroups.includes(group)
    );
    return !!hasDemandPlanningAccess;
};

export const checkSupplyPlanningAccess = (user) => {
    if (!user) return false;

    const requiredGroups = ['KC_INTELLIPLAN_USERS_SUPPLY_PLANNING'];

    const hasSupplyPlanningAccess = user.mygroup?.some((group) =>
        requiredGroups.includes(group)
    );
    return !!hasSupplyPlanningAccess;
};