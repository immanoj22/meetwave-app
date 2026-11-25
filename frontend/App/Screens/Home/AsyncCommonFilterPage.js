import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { c } from '../../Utilities/colors';
import { Fonts } from '../../Utilities/fonts';
import { useSelector } from 'react-redux';

const filterPageLoaders = {
  People: () => import('./CommonFilterPage.People'),
  Chat: () => import('./CommonFilterPage.Chat'),
  Activities: () => import('./CommonFilterPage.Activities'),
};

// Module-level caches — survive across navigation / re-mounts
const filterPageCache = {};
const filterComponentCache = {};

function FilterOpeningLoader() {
  const liftAnim = useRef(new Animated.Value(8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dotAnims = useRef([
    new Animated.Value(0.35),
    new Animated.Value(0.35),
    new Animated.Value(0.35),
  ]).current;

  useEffect(() => {
    const entranceAnimation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(liftAnim, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    const pulseAnimations = dotAnims.map((dotAnim) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, {
            toValue: 1,
            duration: 520,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim, {
            toValue: 0.35,
            duration: 520,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    entranceAnimation.start();
    const staggeredPulse = Animated.stagger(140, pulseAnimations);
    staggeredPulse.start();

    return () => {
      entranceAnimation.stop();
      staggeredPulse.stop();
      dotAnims.forEach((dotAnim) => dotAnim.stopAnimation());
    };
  }, [dotAnims, fadeAnim, liftAnim]);

  return (
    <View style={styles.openingLoaderOverlay} pointerEvents="none">
      <Animated.View style={[styles.openingBackdrop, { opacity: fadeAnim }]} />
      <Animated.View
        style={[
          styles.loaderSheet,
          {
            opacity: fadeAnim,
            transform: [{ translateY: liftAnim }],
          },
        ]}
      >
        <View style={styles.loaderHandle} />
        <View style={styles.loaderHeroRow}>
          <View style={styles.loaderHeroText}>
            <Text style={styles.loaderEyebrow}>Preparing filters</Text>
            <Text style={styles.loaderTitle}>Loading your workspace</Text>
            <Text style={styles.loaderSubtitle}>
              We are getting the filter controls ready.
            </Text>
          </View>
          <View style={styles.loaderBadge}>
            {dotAnims.map((dotAnim, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.loaderDot,
                  {
                    opacity: dotAnim,
                    transform: [
                      {
                        scale: dotAnim.interpolate({
                          inputRange: [0.35, 1],
                          outputRange: [0.88, 1.08],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.loaderSection}>
          <View style={[styles.loaderLine, styles.loaderLineWide]} />
          <View style={[styles.loaderLine, styles.loaderLineMid]} />
        </View>

        <View style={styles.loaderChipRow}>
          <View style={styles.loaderChip} />
          <View style={styles.loaderChip} />
          <View style={[styles.loaderChip, styles.loaderChipShort]} />
        </View>

        <View style={styles.loaderCard}>
          <View style={[styles.loaderLine, styles.loaderLineWide]} />
          <View style={[styles.loaderLine, styles.loaderLineShort]} />
          <View style={styles.loaderSliderTrack}>
            <View style={styles.loaderSliderFill} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

/**
 * Pre-warm a tab's bundle in the background so it is ready before the
 * modal opens. Call this as early as possible (e.g. when the user
 * lands on the home screen).
 */
export function preloadFilterTab(tab = 'People') {
  const loader = filterPageLoaders[tab] || filterPageLoaders.People;
  if (!filterPageCache[tab]) {
    filterPageCache[tab] = loader().then((module) => {
      filterComponentCache[tab] = module.default;
      return module;
    });
  } else if (!filterComponentCache[tab]) {
    filterPageCache[tab].then((module) => {
      filterComponentCache[tab] = module.default;
    });
  }
  return filterPageCache[tab];
}

export function preloadAllCommonFilterTabs() {
  return Promise.all([
    preloadFilterTab('People'),
    preloadFilterTab('Chat'),
    preloadFilterTab('Activities'),
  ]);
}

export default function AsyncCommonFilterPage(props) {
  const reduxActiveTab = useSelector((s) => s?.helper?.filterBysearch?.activeTab);
  // IMPORTANT: freeze the tab for the lifetime of this screen instance.
  // If reduxActiveTab flips while the bottom sheet is opening, swapping the
  // loaded component mid-animation can make the sheet "disappear" / dismiss.
  const initialTabRef = useRef(null);
  if (initialTabRef.current == null) {
    initialTabRef.current = reduxActiveTab || 'People';
  }
  const tab = useMemo(() => props?.forcedTab || initialTabRef.current, [props?.forcedTab]);

  // If already cached, render immediately — no flash at all
  const [LoadedComponent, setLoadedComponent] = useState(
    () => filterComponentCache[tab] || null,
  );

  useEffect(() => {
    // Already cached — nothing to do
    if (filterComponentCache[tab]) {
      setLoadedComponent(() => filterComponentCache[tab]);
      return;
    }

    // Not cached yet — start loading IMMEDIATELY (no InteractionManager).
    // InteractionManager was the root cause: it waited for the modal open
    // animation to finish before even starting the import, which caused
    // the loader → real-component swap to happen mid-interaction and
    // made the sheet appear to close and reopen.
    let isMounted = true;

    const loader = filterPageLoaders[tab] || filterPageLoaders.People;
    filterPageCache[tab] = filterPageCache[tab] || loader();

    filterPageCache[tab].then((module) => {
      if (!isMounted) return;
      filterComponentCache[tab] = module.default;
      setLoadedComponent(() => filterComponentCache[tab]);
    });

    return () => {
      isMounted = false;
    };
  }, [tab]);

  // This screen is only the lazy-loading host. The loaded filter component
  // owns the real Gorhom bottom sheet, so avoid drawing a second purple sheet
  // here while the bundle loads.
  return (
    <View style={styles.container}>
      {LoadedComponent ? (
        <LoadedComponent key={tab} {...props} visible={props.visible ?? true} />
      ) : null}

      {!LoadedComponent ? <FilterOpeningLoader /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  openingLoaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  openingBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.18)',
  },
  loaderSheet: {
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 22,
    backgroundColor: '#FFFDF7',
    borderWidth: 1,
    borderColor: 'rgba(245, 187, 34, 0.14)',
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: {
      width: 0,
      height: -6,
    },
    elevation: 10,
  },
  loaderHandle: {
    alignSelf: 'center',
    width: 52,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.12)',
    marginBottom: 18,
  },
  loaderHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  loaderHeroText: {
    flex: 1,
  },
  loaderEyebrow: {
    fontFamily: Fonts.SemiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: c.primary,
    marginBottom: 6,
  },
  loaderTitle: {
    fontFamily: Fonts.Bold,
    fontSize: 20,
    lineHeight: 26,
    color: '#111827',
    marginBottom: 4,
  },
  loaderSubtitle: {
    fontFamily: Fonts.Regular,
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
  },
  loaderBadge: {
    minWidth: 66,
    height: 42,
    marginLeft: 12,
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 187, 34, 0.12)',
  },
  loaderDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginHorizontal: 3,
    backgroundColor: c.primary,
  },
  loaderSection: {
    marginBottom: 14,
  },
  loaderLine: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#F2EFE6',
  },
  loaderLineWide: {
    width: '88%',
    marginBottom: 10,
  },
  loaderLineMid: {
    width: '62%',
  },
  loaderLineShort: {
    width: '42%',
    marginBottom: 18,
  },
  loaderChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  loaderChip: {
    width: 92,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F7E7BA',
    marginRight: 10,
    marginBottom: 10,
  },
  loaderChipShort: {
    width: 74,
  },
  loaderCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F2E9CF',
  },
  loaderSliderTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  loaderSliderFill: {
    width: '58%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: c.primary,
  },
});
