// Feature Flags for Gradual Rollout
// Disable features here to rollback instantly without code changes

export const FEATURES = {
  // Phase 0: Foundation
  SECURITY_FIXES: true,
  DATA_MIGRATION: true,
  TESTING_INFRASTRUCTURE: true,
  ERROR_HANDLING: true,
  
  // Phase 1: Storage
  NEW_STORAGE: false,
  OFFLINE_SUPPORT: false,
  
  // Phase 2: Authentication
  NEW_CMS_AUTH: false,
  NETLIFY_IDENTITY: false,
  
  // Phase 3: Images
  NEW_IMAGES: false,
  IMAGE_OPTIMIZATION: false,
  
  // Phase 4: Deployment
  NEW_DEPLOY: false,
  REAL_TIME_DEPLOY: false,
  
  // Phase 5: Polish
  PERFORMANCE_OPTIMIZATION: false,
  UX_POLISH: false,
};

// Helper function to check if feature is enabled
export function isFeatureEnabled(feature) {
  return FEATURES[feature] === true;
}
