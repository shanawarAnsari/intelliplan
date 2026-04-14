
import React from "react";
import { Box } from "@mui/material";
import { useUserStore } from "../../store/userStore";
import FeatureCallbackError from "./FeatureCallbackError";
import { Loader } from "../../utils/Loader";

/**
 * Wrap a route's element to enforce feature-level access.
 * @param {function} checkFn - function(user) => boolean
 * @param {React.ReactNode} children - content to render if allowed
 */
const FeatureGuard = ({ checkFn, children }) => {
    const isLoggedIn = useUserStore((s) => s.isLoggedIn);
    const isUserLoading = useUserStore((s) => s.isUserLoading);
    const user = useUserStore((s) => s.user);

    if (isUserLoading) {
        return (
            <Loader />
        );
    }

    // If not logged in, let AuthGuard handle it at a higher level.
    if (!isLoggedIn) {
        return null;
    }

    // If logged in but user missing or no feature access → block
    if (!user || !checkFn(user)) {
        return <FeatureCallbackError />; // You can replace this with a 403 page if you prefer
    }

    return children;
};

export default FeatureGuard;
