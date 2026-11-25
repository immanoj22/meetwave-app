import React from 'react';
import AsyncCommonFilterPage from './AsyncCommonFilterPage';

/**
 * Dedicated filter screen for the People tab.
 * Keeping this as a thin wrapper lets us route by tab and later optimize
 * per-tab rendering without changing callers.
 */
export default function PeopleFilterPage(props) {
  return <AsyncCommonFilterPage {...props} forcedTab="People" />;
}

