import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { c } from '../Utilities/colors';
import { Fonts } from '../Utilities/fonts';

class ErrorBoundary extends React.PureComponent {
  state = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (__DEV__) {
      console.error('Render error caught by ErrorBoundary:', error, info);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          Please try again. If this continues, restart the app.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retry loading app"
          onPress={this.handleRetry}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: c.primary,
  },
  title: {
    color: c.white,
    fontFamily: Fonts.Bold,
    fontSize: RFValue(18),
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    color: c.white,
    fontFamily: Fonts.Regular,
    fontSize: RFValue(13),
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: c.white,
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  retryText: {
    color: c.primary,
    fontFamily: Fonts.Bold,
    fontSize: RFValue(14),
  },
});

export default ErrorBoundary;
