import React from 'react';
import AsyncCommonFilterPage from './AsyncCommonFilterPage';

/**
 * Dedicated filter screen for the Chat/Groups tab.
 */
export default function ChatFilterPage(props) {
  return <AsyncCommonFilterPage {...props} forcedTab="Chat" />;
}

