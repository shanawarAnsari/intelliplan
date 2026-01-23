export const hasValidAccess = (user) => {
    if (!user) return false;

    const requiredGroups = [
        "KC_INTELLIPLAN_USERS_ACCESS_NONPROD",
        "KC_INTELLIPLAN_USERS_ACCESS_PROD",
    ];

    const hasGroup = user.mygroup?.some((group) =>
        requiredGroups.includes(group)
    );

    return !!hasGroup;
};

export const isAdminUser = (user) => {
    return user.myrole?.some((role) =>
        ["KC_INTELLIPLAN_USERS_ROLE_ADMIN"].includes(role)
    );
};