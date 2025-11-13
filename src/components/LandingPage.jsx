import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import LocalShipping from '@mui/icons-material/LocalShipping';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import { useNavigate } from 'react-router-dom';
import landingBg from '../assets/landing.png';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Run Rate Simulator',
      description: 'Simulate your shipments with run rates easily.',
      icon: <LocalShipping sx={{ fontSize: 48, mb: 1 }} />,
      route: '/runrate',
    },
    {
      title: 'Ask Intelliplan AI',
      description: 'Get instant insights and answers powered by AI.',
      icon: <AutoAwesome sx={{ fontSize: 48, mb: 1 }} />,
      route: '/ask-ai',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '93vh',
        backgroundImage: `url(${landingBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Hero Section */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', pl: { xs: 2, md: 8 }, pr: { xs: 2 } }}>
        <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
          Simulate Better, Plan Smarter!
        </Typography>
        <Typography variant="h5" sx={{ mb: 6, maxWidth: 500 }}>
          Intelliplan helps you analyze and simulate supply chain performances with confidence.
        </Typography>
      </Box>

      {/* Feature Cards */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 8 }}>
        <Grid container spacing={4} justifyContent="center">
          {features.map((feature, index) => (
            <Grid item key={index}>
              <Card
                sx={{
                  width: 280,
                  height: 240, // ✅ Fixed height for uniform size
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(12px)',
                  color: '#fff',
                  textAlign: 'center',
                  p: 2,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center', // ✅ Centers content vertically
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                  },
                }}
              >
                {feature.icon}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography sx={{ mb: 2, fontSize: "0.75rem" }}>
                    {feature.description}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      borderRadius: 3,
                      backgroundColor: '#fff',
                      color: '#000',
                      fontWeight: 'bold',
                      '&:hover': {
                        backgroundColor: '#f0f0f0',
                      },
                    }}
                    onClick={() => navigate(feature.route)}
                  >
                    Explore
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box >
  );
};

export default LandingPage;