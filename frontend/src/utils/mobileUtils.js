// Mobile Detection and Routing Utility
export const isMobileDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // Check for mobile devices
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const isMobile = mobileRegex.test(userAgent);
  
  // Check for screen size as backup
  const isSmallScreen = window.innerWidth <= 768;
  
  return isMobile || isSmallScreen;
};

export const shouldRedirectToMobile = () => {
  const currentPath = window.location.pathname;
  const isMobile = isMobileDevice();
  const isAlreadyMobile = currentPath.startsWith('/m/');
  
  return isMobile && !isAlreadyMobile;
};

export const redirectToMobile = () => {
  const currentPath = window.location.pathname;
  const search = window.location.search;
  const hash = window.location.hash;
  
  // Map desktop routes to mobile routes
  const routeMapping = {
    '/': '/m/dashboard',
    '/dashboard': '/m/dashboard',
    '/casino-floor': '/m/casino-floor',
    '/gaming': '/m/gaming',
    '/members': '/m/members',
    '/advanced-analytics': '/m/analytics',
    '/rewards': '/m/rewards',
    '/staff': '/m/staff',
    '/settings': '/m/settings'
  };
  
  const mobileRoute = routeMapping[currentPath] || '/m/dashboard';
  window.location.href = `${mobileRoute}${search}${hash}`;
};

export const getMobileRoute = (desktopRoute) => {
  const routeMapping = {
    '/': '/m/dashboard',
    '/dashboard': '/m/dashboard',
    '/casino-floor': '/m/casino-floor',
    '/gaming': '/m/gaming',
    '/members': '/m/members',
    '/advanced-analytics': '/m/analytics',
    '/rewards': '/m/rewards',
    '/staff': '/m/staff',
    '/settings': '/m/settings'
  };
  
  return routeMapping[desktopRoute] || '/m/dashboard';
};

export const getDesktopRoute = (mobileRoute) => {
  const routeMapping = {
    '/m/dashboard': '/dashboard',
    '/m/casino-floor': '/casino-floor',
    '/m/gaming': '/gaming',
    '/m/members': '/members',
    '/m/analytics': '/advanced-analytics',
    '/m/rewards': '/rewards',
    '/m/staff': '/staff',
    '/m/settings': '/settings'
  };
  
  return routeMapping[mobileRoute] || '/dashboard';
};