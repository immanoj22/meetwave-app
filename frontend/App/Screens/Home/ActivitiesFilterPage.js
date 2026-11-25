import React from 'react';
import AsyncCommonFilterPage from './AsyncCommonFilterPage';

/**
 * Dedicated filter screen for the Activities/Events tab.
 */
export default function ActivitiesFilterPage(props) {
  return <AsyncCommonFilterPage {...props} forcedTab="Activities" />;
}

