import { Tabs } from 'expo-router';
import { StyleSheet, Text, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStateProvider, sampleChats, useAppState } from '@/features/app/app-state';
import { useTheme } from '@/hooks/use-theme';

function TabNavigator() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { incomingLikes } = useAppState();
  const unreadChats = sampleChats.filter((chat) => chat.unread).length;

  return (
    <Tabs
      initialRouteName="discover"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          height: 59 + insets.bottom,
          paddingTop: 5,
          paddingBottom: Math.max(insets.bottom, 5),
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          lineHeight: 13,
          fontWeight: '500',
          marginTop: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 1,
        },
        tabBarHideOnKeyboard: true,
      }}>
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused }) => <TabIcon name="discover" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="likes"
        options={{
          title: 'Likes',
          tabBarBadge: incomingLikes.length || undefined,
          tabBarBadgeStyle: [styles.badge, { backgroundColor: theme.primary, color: theme.surface }],
          tabBarIcon: ({ color, focused }) => <TabIcon name="likes" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarBadge: unreadChats || undefined,
          tabBarBadgeStyle: [styles.badge, { backgroundColor: theme.primary, color: theme.surface }],
          tabBarIcon: ({ color, focused }) => <TabIcon name="chats" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => <TabIcon name="profile" color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <AppStateProvider>
      <TabNavigator />
    </AppStateProvider>
  );
}

function TabIcon({
  name,
  color,
  focused,
}: {
  name: 'discover' | 'likes' | 'chats' | 'profile';
  color: ColorValue;
  focused: boolean;
}) {
  if (name === 'likes') {
    return <Text style={[styles.heartIcon, { color }]}>{focused ? '♥' : '♡'}</Text>;
  }

  if (name === 'discover') {
    return (
      <View style={styles.searchIcon}>
        <View style={[styles.searchLens, { borderColor: color }]} />
        <View style={[styles.searchHandle, { backgroundColor: color }]} />
      </View>
    );
  }

  if (name === 'chats') {
    return (
      <View
        style={[
          styles.chatIcon,
          { borderColor: color, backgroundColor: focused ? color : 'transparent' },
        ]}>
        <View style={[styles.chatTail, { borderLeftColor: color }]} />
      </View>
    );
  }

  return (
    <View style={styles.profileIcon}>
      <View
        style={[
          styles.profileHead,
          { borderColor: color, backgroundColor: focused ? color : 'transparent' },
        ]}
      />
      <View
        style={[
          styles.profileBody,
          { borderColor: color, backgroundColor: focused ? color : 'transparent' },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    paddingHorizontal: 3,
    fontSize: 9,
    lineHeight: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heartIcon: {
    fontSize: 22,
    lineHeight: 25,
  },
  searchIcon: {
    width: 23,
    height: 23,
    paddingTop: 2,
    paddingLeft: 2,
  },
  searchLens: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 1.7,
  },
  searchHandle: {
    position: 'absolute',
    width: 8,
    height: 1.7,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
    right: 1,
    bottom: 4,
  },
  chatIcon: {
    width: 19,
    height: 15,
    borderRadius: 5,
    borderWidth: 1.5,
    position: 'relative',
    marginTop: 3,
    marginBottom: 5,
  },
  chatTail: {
    position: 'absolute',
    width: 5,
    height: 5,
    bottom: -3,
    left: 3,
    borderLeftWidth: 1.5,
    transform: [{ rotate: '-35deg' }],
  },
  profileIcon: {
    width: 22,
    height: 23,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
  },
  profileHead: {
    width: 8,
    height: 8,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  profileBody: {
    width: 17,
    height: 9,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 1.5,
    borderBottomWidth: 0,
  },
});
