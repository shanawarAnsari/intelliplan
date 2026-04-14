import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { oktaAuth, setOriginalUri } from './oktaConfig';
import { Box, Typography } from '@mui/material'
import { Loader } from '../../utils/Loader';

const LoginStart = () => {
    const location = useLocation();

    useEffect(() => {
        // Prefer a meaningful 'from' page passed by AuthGuard/Nav. Fallback to '/'.
        const fromState = location.state?.from;
        const target = fromState && fromState !== '/login' ? fromState : '/';

        setOriginalUri(target);
        oktaAuth.signInWithRedirect({ originalUri: target });
    }, [location.state]);

    return <Loader />;
}

export default LoginStart;