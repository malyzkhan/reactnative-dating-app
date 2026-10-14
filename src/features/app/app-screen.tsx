import { useState } from 'react';
import {
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/features/auth/auth-provider';
import {
  profiles,
  sampleChats,
  sampleMatches,
  type HomeTab,
  type Profile,
  useAppState,
} from '@/features/app/app-state';

export default function AppScreen({ tab }: { tab: HomeTab }) {
  const theme = useTheme();
  const { signOut } = useAuth();
  const { height: windowHeight } = useWindowDimensions();
  const profilePhotoHeight = Math.max(360, Math.min(440, windowHeight * 0.46));
  const [filterVisible, setFilterVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [safetyVisible, setSafetyVisible] = useState(false);
  const {
    profileIndex,
    setProfileIndex,
    likedProfiles,
    setLikedProfiles,
    incomingLikes,
    setIncomingLikes,
    mutualProfiles,
    setMutualProfiles,
    profileName,
    setProfileName,
    profileBio,
    setProfileBio,
    selectedInterests,
    setSelectedInterests,
    ageRange,
    setAgeRange,
    distance,
    setDistance,
    intention,
    setIntention,
    notice,
    setNotice,
  } = useAppState();
  const profile = profiles[profileIndex];

  const moveToNextProfile = (message: string) => {
    setNotice(message);
    setProfileIndex((current) => (current + 1) % profiles.length);
  };

  const handleLike = (person: Profile) => {
    setLikedProfiles((current) =>
      current.some((item) => item.name === person.name) ? current : [...current, person],
    );
    moveToNextProfile(`You liked ${person.name}. We’ll let you know if it’s a match.`);
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  };

  const makeMatch = (person: Profile) => {
    setIncomingLikes((current) => current.filter((item) => item.name !== person.name));
    setMutualProfiles((current) =>
      current.some((item) => item.name === person.name) ? current : [...current, person],
    );
    setNotice(`It’s a match with ${person.name}. Say hello when you’re ready.`);
  };

  const closeModal = () => {
    setFilterVisible(false);
    setDetailsVisible(false);
    setSafetyVisible(false);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.page,
          tab !== 'discover' && styles.secondaryPage,
        ]}
        showsVerticalScrollIndicator={false}
        bounces>
        <View style={styles.header}>
          <View>
            <Text style={[styles.wordmark, { color: theme.primary }]}>twin</Text>
            <View style={styles.locationRow}>
              <Text style={[styles.locationMark, { color: theme.primary }]}>⌖</Text>
              <Text style={[styles.location, { color: theme.textSecondary }]}>Brooklyn, NY</Text>
              <Text style={[styles.locationChevron, { color: theme.textMuted }]}>⌄</Text>
            </View>
          </View>
          {tab === 'discover' ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open discovery filters"
              onPress={() => setFilterVisible(true)}
              style={({ pressed }) => [
                styles.filterButton,
                { backgroundColor: theme.surface, borderColor: theme.border },
                pressed && styles.pressed,
              ]}>
              <Text style={[styles.filterGlyph, { color: theme.textPrimary }]}>☷</Text>
              <Text style={[styles.filterLabel, { color: theme.textPrimary }]}>Filters</Text>
            </Pressable>
          ) : (
            <Text style={[styles.headerContext, { color: theme.textSecondary }]}>
              {tab === 'likes' && 'Your interest'}
              {tab === 'chats' && 'Your conversations'}
              {tab === 'profile' && 'Your space'}
            </Text>
          )}
        </View>

        {notice ? (
          <View style={[styles.notice, { backgroundColor: theme.surfaceMuted }]}>
            <Text style={[styles.noticeText, { color: theme.textSecondary }]}>{notice}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dismiss message"
              onPress={() => setNotice('')}>
              <Text style={[styles.dismissGlyph, { color: theme.textMuted }]}>×</Text>
            </Pressable>
          </View>
        ) : null}

        {tab === 'discover' ? (
          <>
        <View style={styles.intro}>
          <Text style={[styles.eyebrow, { color: theme.primary }]}>A GOOD PLACE TO START</Text>
          <Text style={[styles.headline, { color: theme.textPrimary }]}>
            Meet someone{'\n'}worth knowing.
          </Text>
          <Text style={[styles.subheading, { color: theme.textSecondary }]}>
            Thoughtful introductions, picked for you.
          </Text>
        </View>

        <View style={styles.cardSection}>
          <ImageBackground
            source={{ uri: profile.image }}
            style={[styles.profilePhoto, { height: profilePhotoHeight }]}
            imageStyle={styles.profilePhotoImage}
            resizeMode="cover">
            <View style={styles.photoTopRow}>
              <View style={styles.distancePill}>
                <Text style={styles.distanceGlyph}>⌖</Text>
                <Text style={styles.distanceText}>{profile.distance}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Block or report this profile"
                onPress={() => setSafetyVisible(true)}
                style={({ pressed }) => [styles.moreButton, pressed && styles.pressed]}>
                <Text style={styles.moreGlyph}>···</Text>
              </Pressable>
            </View>

            <View style={styles.photoBottom}>
              <View style={styles.activeRow}>
                <View style={styles.activeDot} />
                <Text style={styles.activeText}>Recently active</Text>
                {profile.verified && (
                  <View style={styles.verifiedPill}>
                    <Text style={styles.verifiedCheck}>✓</Text>
                    <Text style={styles.verifiedLabel}>Verified</Text>
                  </View>
                )}
              </View>
              <Text style={styles.profileName}>
                {profile.name}, {profile.age}
              </Text>
              <Text style={styles.profileWork}>{profile.work}</Text>
              <Text style={styles.profileBio} numberOfLines={3}>
                {profile.bio}
              </Text>
              <View style={styles.interestRow}>
                {profile.interests.map((interest) => (
                  <View key={interest} style={styles.interestPill}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ImageBackground>
          <Pressable
            accessibilityRole="button"
            onPress={() => setDetailsVisible(true)}
            style={({ pressed }) => [
              styles.detailsLink,
              { borderColor: theme.border },
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.detailsLabel, { color: theme.textSecondary }]}>
              More about {profile.name}
            </Text>
            <Text style={[styles.detailsChevron, { color: theme.primary }]}>→</Text>
          </Pressable>
        </View>

        <View style={styles.actionArea}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Pass on this profile"
            onPress={() => moveToNextProfile(`You passed on ${profile.name}.`)}
            style={({ pressed }) => [
              styles.passButton,
              { backgroundColor: theme.surface, borderColor: theme.border },
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.passGlyph, { color: theme.textSecondary }]}>×</Text>
            <Text style={[styles.passLabel, { color: theme.textSecondary }]}>Pass</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Like ${profile.name}`}
            onPress={() => handleLike(profile)}
            style={({ pressed }) => [
              styles.likeButton,
              { backgroundColor: theme.primary },
              pressed && styles.pressed,
            ]}>
            <Text style={styles.likeGlyph}>♡</Text>
            <Text style={styles.likeLabel}>Like {profile.name}</Text>
          </Pressable>
        </View>

        <Text style={[styles.safetyNote, { color: theme.textMuted }]}>
            Your comfort comes first. You can block or report a profile at any time.
        </Text>
          </>
        ) : tab === 'likes' ? (
          <LikesScreen
            theme={theme}
            likedProfiles={likedProfiles}
            incomingLikes={incomingLikes}
            mutualProfiles={mutualProfiles}
            onMatch={makeMatch}
            onOpenProfile={(person) => {
              setProfileIndex(profiles.findIndex((item) => item.name === person.name) >= 0
                ? profiles.findIndex((item) => item.name === person.name)
                : 0);
              setDetailsVisible(true);
            }}
          />
        ) : tab === 'chats' ? (
          <ChatsScreen
            theme={theme}
            mutualProfiles={mutualProfiles}
            onOpenChat={(name) => setNotice(`Opening your conversation with ${name}.`)}
          />
        ) : (
          <ProfileScreen
            theme={theme}
            name={profileName}
            bio={profileBio}
            intention={intention}
            selectedInterests={selectedInterests}
            onNameChange={setProfileName}
            onBioChange={setProfileBio}
            onIntentionChange={setIntention}
            onToggleInterest={toggleInterest}
            onMessage={setNotice}
            onOpenPreferences={() => setFilterVisible(true)}
            onSignOut={() => {
              void signOut().catch(() => setNotice('We couldn’t sign you out. Please try again.'));
            }}
          />
        )}
      </ScrollView>

      <Modal
        visible={filterVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalScrim} onPress={closeModal} />
          <View style={[styles.sheet, { backgroundColor: theme.background }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeading}>
              <View>
                <Text style={[styles.sheetEyebrow, { color: theme.primary }]}>MAKE IT YOURS</Text>
                <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Your preferences</Text>
              </View>
              <Pressable onPress={closeModal} accessibilityLabel="Close filters">
                <Text style={[styles.closeGlyph, { color: theme.textSecondary }]}>×</Text>
              </Pressable>
            </View>

            <Text style={[styles.filterSectionTitle, { color: theme.textPrimary }]}>Age range</Text>
            <View style={styles.optionRow}>
              {(['25–30', '28–35', 'Any age'] as const).map((option) => (
                <OptionPill
                  key={option}
                  label={option}
                  selected={ageRange === option}
                  onPress={() => setAgeRange(option)}
                  theme={theme}
                />
              ))}
            </View>
            <Text style={[styles.filterSectionTitle, { color: theme.textPrimary }]}>Within</Text>
            <View style={styles.optionRow}>
              {(['10', '25', '50'] as const).map((option) => (
                <OptionPill
                  key={option}
                  label={`${option} miles`}
                  selected={distance === option}
                  onPress={() => setDistance(option)}
                  theme={theme}
                />
              ))}
            </View>
            <Text style={[styles.filterSectionTitle, { color: theme.textPrimary }]}>Looking for</Text>
            <View style={styles.optionColumn}>
              {['Long-term relationship', 'Open to seeing where it goes', 'New friends'].map((option) => (
                <Pressable
                  key={option}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: intention === option }}
                  onPress={() => setIntention(option)}
                  style={[
                    styles.intentionOption,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    intention === option && { borderColor: theme.primary },
                  ]}>
                  <Text style={[styles.intentionText, { color: theme.textPrimary }]}>{option}</Text>
                  <View
                    style={[
                      styles.radioOuter,
                      { borderColor: intention === option ? theme.primary : theme.border },
                    ]}>
                    {intention === option && (
                      <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={closeModal}
              style={({ pressed }) => [
                styles.applyButton,
                { backgroundColor: theme.primary },
                pressed && styles.pressed,
              ]}>
              <Text style={styles.applyLabel}>Show me people</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={detailsVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalScrim} onPress={closeModal} />
          <View style={[styles.sheet, styles.detailsSheet, { backgroundColor: theme.background }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeading}>
              <View>
                <Text style={[styles.sheetEyebrow, { color: theme.primary }]}>A LITTLE MORE ABOUT</Text>
                <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>
                  {profile.name}, {profile.age}
                </Text>
              </View>
              <Pressable onPress={closeModal} accessibilityLabel="Close profile details">
                <Text style={[styles.closeGlyph, { color: theme.textSecondary }]}>×</Text>
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <ImageBackground
                source={{ uri: profile.image }}
                style={styles.detailImage}
                imageStyle={styles.detailImageStyle}>
                <View style={styles.detailVerified}>
                  <Text style={styles.verifiedCheck}>✓</Text>
                  <Text style={styles.verifiedLabel}>Identity verified</Text>
                </View>
              </ImageBackground>
              <Text style={[styles.detailLocation, { color: theme.textSecondary }]}>
                {profile.city} · {profile.distance}
              </Text>
              <Text style={[styles.filterSectionTitle, { color: theme.textPrimary }]}>A little about me</Text>
              <Text style={[styles.detailBio, { color: theme.textSecondary }]}>{profile.bio}</Text>
              <Text style={[styles.filterSectionTitle, { color: theme.textPrimary }]}>Things I love</Text>
              <View style={styles.optionRow}>
                {profile.interests.map((interest) => (
                  <View
                    key={interest}
                    style={[styles.detailInterest, { backgroundColor: theme.surfaceMuted }]}>
                    <Text style={[styles.detailInterestText, { color: theme.textPrimary }]}>{interest}</Text>
                  </View>
                ))}
              </View>
              <View style={[styles.safetyInline, { borderTopColor: theme.border }]}>
                <Text style={[styles.safetyNote, { color: theme.textMuted }]}>
                  Take your time getting to know each other. Keep conversations respectful.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setDetailsVisible(false);
                    setSafetyVisible(true);
                  }}>
                  <Text style={[styles.reportLink, { color: theme.primary }]}>Report profile</Text>
                </Pressable>
              </View>
            </ScrollView>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setDetailsVisible(false);
                handleLike(profile);
              }}
              style={({ pressed }) => [
                styles.applyButton,
                { backgroundColor: theme.primary },
                pressed && styles.pressed,
              ]}>
              <Text style={styles.applyLabel}>Like {profile.name}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={safetyVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}>
        <View style={[styles.centerModal, { backgroundColor: 'rgba(22, 19, 18, 0.42)' }]}>
          <View style={[styles.safetyCard, { backgroundColor: theme.surface }]}>
            <View style={styles.safetyIcon}>
              <Text style={[styles.safetyIconGlyph, { color: theme.primary }]}>!</Text>
            </View>
            <Text style={[styles.sheetTitle, styles.safetyTitle, { color: theme.textPrimary }]}>
              Your safety matters
            </Text>
            <Text style={[styles.safetyDescription, { color: theme.textSecondary }]}>
              Choose what you’d like to do with {profile.name}’s profile.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                closeModal();
                moveToNextProfile(`${profile.name} has been blocked. You won’t see this profile again.`);
              }}
              style={[styles.safetyAction, { borderColor: theme.border }]}>
              <Text style={[styles.safetyActionTitle, { color: theme.textPrimary }]}>Block profile</Text>
              <Text style={[styles.safetyActionDescription, { color: theme.textMuted }]}>
                You won’t see each other on Twin.
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                closeModal();
                setNotice(`Thanks for letting us know. We’ll review ${profile.name}’s profile.`);
              }}
              style={[styles.safetyAction, { borderColor: theme.border }]}>
              <Text style={[styles.reportTitle, { color: theme.error }]}>Report profile</Text>
              <Text style={[styles.safetyActionDescription, { color: theme.textMuted }]}>
                Let us know if something doesn’t feel right.
              </Text>
            </Pressable>
            <Pressable onPress={closeModal} style={styles.cancelButton}>
              <Text style={[styles.cancelLabel, { color: theme.textSecondary }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function OptionPill({
  label,
  selected,
  onPress,
  theme,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  theme: typeof Colors.light | typeof Colors.dark;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.optionPill,
        {
          backgroundColor: selected ? theme.backgroundElement : theme.surface,
          borderColor: selected ? theme.primary : theme.border,
        },
      ]}>
      <Text style={[styles.optionLabel, { color: selected ? theme.primary : theme.textSecondary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

type Theme = typeof Colors.light | typeof Colors.dark;

function LikesScreen({
  theme,
  likedProfiles,
  incomingLikes,
  mutualProfiles,
  onMatch,
  onOpenProfile,
}: {
  theme: Theme;
  likedProfiles: Profile[];
  incomingLikes: Profile[];
  mutualProfiles: Profile[];
  onMatch: (person: Profile) => void;
  onOpenProfile: (person: Profile) => void;
}) {
  return (
    <View>
      <Text style={[styles.sectionEyebrow, { color: theme.textMuted }]}>A LITTLE SPARK</Text>
      <Text style={[styles.pageTitle, { color: theme.textPrimary }]}>Likes</Text>
      <Text style={[styles.pageDescription, { color: theme.textSecondary }]}>
        See where the feeling might be mutual.
      </Text>

      <View style={styles.tabSection}>
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>They like you</Text>
          <View style={[styles.unreadCount, { backgroundColor: theme.backgroundElement }]}>
            <Text style={[styles.unreadCountText, { color: theme.primary }]}>{incomingLikes.length}</Text>
          </View>
        </View>
        {incomingLikes.length ? (
          <View style={styles.peopleList}>
            {incomingLikes.map((person) => (
              <View
                key={person.name}
                style={[styles.personCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => onOpenProfile(person)}
                  style={styles.personInfo}>
                  <Image source={{ uri: person.image }} style={styles.personAvatar} />
                  <View style={styles.personCopy}>
                    <Text style={[styles.personName, { color: theme.textPrimary }]}>
                      {person.name}, {person.age}
                    </Text>
                    <Text style={[styles.personCaption, { color: theme.textSecondary }]} numberOfLines={1}>
                      {person.work} · {person.distance}
                    </Text>
                  </View>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Like ${person.name} back`}
                  onPress={() => onMatch(person)}
                  style={[styles.smallLikeButton, { backgroundColor: theme.primary }]}>
                  <Text style={styles.smallLikeGlyph}>♡</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <EmptyMessage
            theme={theme}
            title="You’re all caught up"
            text="When someone new likes your profile, you’ll find them here."
          />
        )}
      </View>

      <View style={styles.tabSection}>
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Mutual matches</Text>
          <Text style={[styles.sectionCount, { color: theme.textMuted }]}>{mutualProfiles.length}</Text>
        </View>
        {mutualProfiles.length ? (
          <View style={styles.peopleList}>
            {mutualProfiles.map((person) => (
              <View
                key={person.name}
                style={[styles.personCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => onOpenProfile(person)}
                  style={styles.personInfo}>
                  <Image source={{ uri: person.image }} style={styles.personAvatar} />
                  <View style={styles.personCopy}>
                    <Text style={[styles.personName, { color: theme.textPrimary }]}>{person.name}</Text>
                    <Text style={[styles.personCaption, { color: theme.textSecondary }]}>
                      You both said yes.
                    </Text>
                  </View>
                </Pressable>
                <Text style={[styles.mutualMark, { color: theme.primary }]}>♥</Text>
              </View>
            ))}
          </View>
        ) : (
          <EmptyMessage
            theme={theme}
            title="Your next mutual match is out there"
            text="Like someone you’re curious about. If they like you too, you’ll meet here."
          />
        )}
      </View>

      <View style={styles.tabSection}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>People you’ve liked</Text>
        {likedProfiles.length ? (
          <View style={styles.peopleList}>
            {likedProfiles.map((person) => (
              <Pressable
                key={person.name}
                accessibilityRole="button"
                onPress={() => onOpenProfile(person)}
                style={[styles.personCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Image source={{ uri: person.image }} style={styles.personAvatar} />
                <View style={styles.personCopy}>
                  <Text style={[styles.personName, { color: theme.textPrimary }]}>
                    {person.name}, {person.age}
                  </Text>
                  <Text style={[styles.personCaption, { color: theme.textSecondary }]}>Like sent</Text>
                </View>
                <Text style={[styles.mutualMark, { color: theme.primary }]}>♡</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <EmptyMessage
            theme={theme}
            title="Your likes will show up here"
            text="When a profile catches your eye, tap Like to save it to this list."
          />
        )}
      </View>
    </View>
  );
}

function ChatsScreen({
  theme,
  mutualProfiles,
  onOpenChat,
}: {
  theme: Theme;
  mutualProfiles: Profile[];
  onOpenChat: (name: string) => void;
}) {
  const [searchText, setSearchText] = useState('');
  const visibleChats = sampleChats.filter((chat) =>
    `${chat.name} ${chat.message}`.toLowerCase().includes(searchText.toLowerCase()),
  );
  const matches = [
    ...mutualProfiles.map((person) => ({ name: person.name, image: person.image, color: '#E8D9D8' })),
    ...sampleMatches.filter((match) => !mutualProfiles.some((person) => person.name === match.name)),
  ];

  return (
    <View>
      <Text style={[styles.sectionEyebrow, { color: theme.textMuted }]}>KEEP THE GOOD CONVERSATIONS GOING</Text>
      <Text style={[styles.pageTitle, { color: theme.textPrimary }]}>Chats</Text>
      <Text style={[styles.pageDescription, { color: theme.textSecondary }]}>
        A thoughtful message is a lovely place to begin.
      </Text>

      <View style={styles.chatSearch}>
        <Text style={[styles.searchGlyph, { color: theme.textMuted }]}>⌕</Text>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search conversations"
          placeholderTextColor={theme.textMuted}
          accessibilityLabel="Search conversations"
          style={[styles.searchInput, { color: theme.textPrimary }]}
        />
      </View>

      <View style={styles.tabSection}>
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Your matches</Text>
          <Text style={[styles.sectionCount, { color: theme.textMuted }]}>
            {matches.length}
          </Text>
        </View>
        <View style={styles.matchesRow}>
          {matches.map((match) => (
            <Pressable
              key={match.name}
              accessibilityRole="button"
              onPress={() => onOpenChat(match.name)}
              style={styles.matchItem}>
              <View style={[styles.matchAvatarWrap, { backgroundColor: match.color, borderColor: theme.background }]}>
                <Image source={{ uri: match.image }} style={styles.matchAvatar} />
              </View>
              <Text style={[styles.matchName, { color: theme.textPrimary }]}>{match.name}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.tabSection}>
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Messages</Text>
          <Text style={[styles.sectionCount, { color: theme.textMuted }]}>
            {visibleChats.length} conversations
          </Text>
        </View>
        <View style={[styles.chatList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {visibleChats.length ? visibleChats.map((chat, index) => {
            const match = sampleMatches.find((item) => item.name === chat.name);
            return (
              <Pressable
                key={chat.name}
                accessibilityRole="button"
                onPress={() => onOpenChat(chat.name)}>
                <View style={styles.chatRow}>
                  <Image
                    source={{ uri: match?.image }}
                    style={[styles.chatAvatar, { backgroundColor: match?.color ?? theme.surfaceMuted }]}
                  />
                  <View style={styles.chatCopy}>
                    <View style={styles.chatNameLine}>
                      <Text style={[styles.chatName, { color: theme.textPrimary }]}>{chat.name}</Text>
                      <Text style={[styles.chatTime, { color: theme.textMuted }]}>{chat.time}</Text>
                    </View>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.chatMessage,
                        { color: chat.unread ? theme.textPrimary : theme.textSecondary },
                      ]}>
                      {chat.message}
                    </Text>
                  </View>
                  {chat.unread && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
                </View>
                {index < visibleChats.length - 1 && (
                  <View style={[styles.chatDivider, { backgroundColor: theme.border }]} />
                )}
              </Pressable>
            );
          }) : (
            <EmptyMessage
              theme={theme}
              title="No conversations found"
              text="Try a different name or message."
            />
          )}
        </View>
      </View>
    </View>
  );
}

function ProfileScreen({
  theme,
  name,
  bio,
  intention,
  selectedInterests,
  onNameChange,
  onBioChange,
  onIntentionChange,
  onToggleInterest,
  onMessage,
  onOpenPreferences,
  onSignOut,
}: {
  theme: Theme;
  name: string;
  bio: string;
  intention: string;
  selectedInterests: string[];
  onNameChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onIntentionChange: (value: string) => void;
  onToggleInterest: (interest: string) => void;
  onMessage: (message: string) => void;
  onOpenPreferences: () => void;
  onSignOut: () => void;
}) {
  const settings = [
    { label: 'Dating intentions', detail: intention, mark: '♡' },
    { label: 'Discovery preferences', detail: 'Age, distance & more', mark: '⌕' },
    { label: 'Profile verification', detail: 'Build trust with a verified badge', mark: '✓' },
    { label: 'Privacy & safety', detail: 'Control who sees your profile', mark: '⌑' },
    { label: 'Account', detail: 'Sign out of Twin', mark: '···' },
  ];
  const interests = ['Art & design', 'Travel', 'Cooking', 'Live music', 'Books', 'Outdoors'];

  return (
    <View>
      <Text style={[styles.sectionEyebrow, { color: theme.textMuted }]}>SHOW UP AS YOURSELF</Text>
      <Text style={[styles.pageTitle, { color: theme.textPrimary }]}>Your profile</Text>
      <Text style={[styles.pageDescription, { color: theme.textSecondary }]}>
        A few thoughtful details help the right person find you.
      </Text>

      <View style={[styles.profileEditor, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.editorPhotoRow}>
          <View style={styles.editorImageWrap}>
            <Image source={{ uri: profiles[0].image }} style={styles.editorImage} />
            <View style={[styles.editPhotoMark, { backgroundColor: theme.primary }]}>
              <Text style={styles.editPhotoGlyph}>+</Text>
            </View>
          </View>
          <View style={styles.editorPhotoCopy}>
            <Text style={[styles.personName, { color: theme.textPrimary }]}>Your first impression</Text>
            <Text style={[styles.personCaption, { color: theme.textSecondary }]}>
              Add up to 6 photos that feel like you.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => onMessage('Photo management will be connected when the backend is ready.')}>
              <Text style={[styles.reportLink, { color: theme.primary }]}>Edit photos</Text>
            </Pressable>
          </View>
        </View>

        <Text style={[styles.formLabel, { color: theme.textSecondary }]}>NAME</Text>
        <TextInput
          accessibilityLabel="Your name"
          value={name}
          onChangeText={onNameChange}
          placeholder="Your name"
          placeholderTextColor={theme.textMuted}
          style={[
            styles.formInput,
            { color: theme.textPrimary, backgroundColor: theme.background, borderColor: theme.border },
          ]}
        />
        <Text style={[styles.formLabel, { color: theme.textSecondary }]}>YOUR BIO</Text>
        <TextInput
          accessibilityLabel="Your bio"
          value={bio}
          onChangeText={onBioChange}
          placeholder="A few words about you"
          placeholderTextColor={theme.textMuted}
          multiline
          textAlignVertical="top"
          style={[
            styles.formInput,
            styles.bioInput,
            { color: theme.textPrimary, backgroundColor: theme.background, borderColor: theme.border },
          ]}
        />

        <Text style={[styles.formLabel, { color: theme.textSecondary }]}>INTERESTS</Text>
        <View style={styles.optionRow}>
          {interests.map((interest) => {
            const selected = selectedInterests.includes(interest);
            return (
              <Pressable
                key={interest}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                onPress={() => onToggleInterest(interest)}
                style={[
                  styles.optionPill,
                  {
                    backgroundColor: selected ? theme.backgroundElement : theme.background,
                    borderColor: selected ? theme.primary : theme.border,
                  },
                ]}>
                <Text style={[styles.optionLabel, { color: selected ? theme.primary : theme.textSecondary }]}>
                  {interest}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={[styles.formLabel, { color: theme.textSecondary }]}>DATING INTENTION</Text>
        <View style={styles.optionRow}>
          {['Long-term relationship', 'Open to seeing where it goes', 'New friends'].map((option) => (
            <OptionPill
              key={option}
              label={option}
              selected={intention === option}
              onPress={() => onIntentionChange(option)}
              theme={theme}
            />
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => onMessage('Your profile changes are saved on this device for now.')}
          style={[styles.applyButton, { backgroundColor: theme.primary }]}>
          <Text style={styles.applyLabel}>Save changes</Text>
        </Pressable>
      </View>

      <View style={styles.tabSection}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Settings & privacy</Text>
        <View style={[styles.settingsList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {settings.map((item, index) => (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              onPress={() => {
                if (item.label === 'Discovery preferences') {
                  onOpenPreferences();
                  return;
                }
                if (item.label === 'Account') {
                  onSignOut();
                  return;
                }

                onMessage(`${item.label} settings will be available here.`);
              }}>
              <View style={styles.settingRow}>
                <View style={[styles.settingIcon, { backgroundColor: theme.surfaceMuted }]}>
                  <Text style={[styles.settingMark, { color: theme.primary }]}>{item.mark}</Text>
                </View>
                <View style={styles.settingCopy}>
                  <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>{item.label}</Text>
                  <Text style={[styles.personCaption, { color: theme.textSecondary }]}>{item.detail}</Text>
                </View>
                <Text style={[styles.detailsChevron, { color: theme.textMuted }]}>›</Text>
              </View>
              {index < settings.length - 1 && (
                <View style={[styles.chatDivider, { backgroundColor: theme.border }]} />
              )}
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

function EmptyMessage({ theme, title, text }: { theme: Theme; title: string; text: string }) {
  return (
    <View style={[styles.emptyMessage, { backgroundColor: theme.surfaceMuted }]}>
      <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>{title}</Text>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  page: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 36,
  },
  secondaryPage: {
    paddingBottom: 28,
  },
  headerContext: {
    fontSize: 12,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 26,
  },
  wordmark: {
    fontFamily: 'serif',
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -1.5,
    lineHeight: 34,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationMark: {
    fontSize: 15,
  },
  location: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.15,
  },
  locationChevron: {
    fontSize: 13,
    marginTop: -3,
  },
  filterButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    borderRadius: 13,
    borderWidth: 1,
  },
  filterGlyph: {
    fontSize: 20,
    lineHeight: 22,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  intro: {
    marginBottom: 18,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 7,
  },
  headline: {
    fontFamily: 'serif',
    fontSize: 35,
    lineHeight: 39,
    letterSpacing: -0.8,
    fontWeight: '500',
  },
  subheading: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  cardSection: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  profilePhoto: {
    height: 470,
    justifyContent: 'space-between',
    backgroundColor: '#B6A79B',
  },
  profilePhotoImage: {
    borderRadius: 22,
  },
  photoTopRow: {
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  distancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 30,
    backgroundColor: 'rgba(25, 24, 22, 0.48)',
  },
  distanceGlyph: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  distanceText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  moreButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(25, 24, 22, 0.48)',
  },
  moreGlyph: {
    color: '#FFFFFF',
    fontSize: 23,
    lineHeight: 17,
    fontWeight: '700',
    marginTop: -8,
  },
  photoBottom: {
    paddingHorizontal: 18,
    paddingTop: 36,
    paddingBottom: 19,
    backgroundColor: 'rgba(23, 21, 20, 0.66)',
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A9D1AA',
  },
  activeText: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 11,
    fontWeight: '500',
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    marginLeft: 3,
  },
  verifiedCheck: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  verifiedLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  profileName: {
    color: '#FFFFFF',
    fontFamily: 'serif',
    fontSize: 31,
    lineHeight: 36,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  profileWork: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  profileBio: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
    maxWidth: 440,
  },
  interestRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  interestPill: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
  },
  interestText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  detailsLink: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 3,
    borderBottomWidth: 1,
  },
  detailsLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailsChevron: {
    fontSize: 18,
  },
  actionArea: {
    flexDirection: 'row',
    gap: 11,
    marginTop: 14,
  },
  passButton: {
    height: 54,
    minWidth: 102,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  passGlyph: {
    fontSize: 25,
    lineHeight: 27,
    fontWeight: '300',
  },
  passLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  likeButton: {
    flex: 1,
    height: 54,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 9,
  },
  likeGlyph: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 24,
  },
  likeLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.78,
  },
  notice: {
    borderRadius: 12,
    marginTop: 12,
    paddingVertical: 11,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  dismissGlyph: {
    fontSize: 19,
  },
  lowerSection: {
    borderTopWidth: 1,
    marginTop: 26,
    paddingTop: 22,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  sectionEyebrow: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 5,
  },
  sectionTitle: {
    fontFamily: 'serif',
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '600',
    paddingBottom: 4,
  },
  matchesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
    marginTop: 17,
  },
  matchItem: {
    alignItems: 'center',
    gap: 7,
  },
  matchAvatarWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    position: 'relative',
  },
  matchAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 29,
  },
  matchDot: {
    position: 'absolute',
    width: 13,
    height: 13,
    borderRadius: 7,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: '#FFFDFA',
  },
  matchName: {
    fontSize: 11,
    fontWeight: '500',
  },
  matchPrompt: {
    alignItems: 'center',
    gap: 7,
  },
  addMatch: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addGlyph: {
    fontSize: 25,
    fontWeight: '300',
  },
  matchHint: {
    fontSize: 11,
    fontWeight: '500',
  },
  chatHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 27,
    marginBottom: 12,
  },
  unreadCount: {
    width: 19,
    height: 19,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadCountText: {
    fontSize: 10,
    fontWeight: '700',
  },
  chatList: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  chatRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    gap: 11,
  },
  chatAvatar: {
    height: 42,
    width: 42,
    borderRadius: 21,
  },
  chatCopy: {
    flex: 1,
    gap: 4,
  },
  chatNameLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatName: {
    fontSize: 13,
    fontWeight: '700',
  },
  chatTime: {
    fontSize: 10,
  },
  chatMessage: {
    fontSize: 12,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginLeft: 2,
  },
  chatDivider: {
    height: 1,
    marginLeft: 66,
  },
  safetyNote: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 13,
  },
  pageTitle: {
    fontFamily: 'serif',
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '600',
    marginTop: 3,
  },
  pageDescription: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
  },
  tabSection: {
    marginTop: 25,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionCount: {
    fontSize: 11,
    fontWeight: '500',
  },
  peopleList: {
    gap: 9,
  },
  personCard: {
    minHeight: 76,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  personInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  personAvatar: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: '#E7DED6',
  },
  personCopy: {
    flex: 1,
    gap: 4,
  },
  personName: {
    fontSize: 13,
    fontWeight: '700',
  },
  personCaption: {
    fontSize: 11,
    lineHeight: 16,
  },
  smallLikeButton: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallLikeGlyph: {
    color: '#FFFFFF',
    fontSize: 21,
  },
  mutualMark: {
    fontSize: 19,
    paddingHorizontal: 5,
  },
  emptyMessage: {
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 17,
    gap: 5,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 12,
    lineHeight: 18,
  },
  chatSearch: {
    height: 46,
    borderRadius: 13,
    backgroundColor: '#F0EBE3',
    marginTop: 19,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchGlyph: {
    fontSize: 22,
    lineHeight: 24,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 13,
    paddingVertical: 0,
  },
  profileEditor: {
    marginTop: 19,
    borderWidth: 1,
    borderRadius: 17,
    padding: 15,
  },
  editorPhotoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginBottom: 19,
  },
  editorImageWrap: {
    position: 'relative',
  },
  editorImage: {
    width: 68,
    height: 68,
    borderRadius: 15,
    backgroundColor: '#E7DED6',
  },
  editPhotoMark: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    width: 23,
    height: 23,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFDFA',
  },
  editPhotoGlyph: {
    fontSize: 17,
    lineHeight: 19,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  editorPhotoCopy: {
    flex: 1,
  },
  formLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.05,
    marginBottom: 7,
    marginTop: 13,
  },
  formInput: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  bioInput: {
    minHeight: 96,
    lineHeight: 19,
  },
  settingsList: {
    borderWidth: 1,
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 12,
  },
  settingRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 11,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingMark: {
    fontSize: 17,
    fontWeight: '600',
  },
  settingCopy: {
    flex: 1,
    gap: 3,
  },
  settingLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(22, 19, 18, 0.42)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 11,
    paddingBottom: 30,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C9C1BA',
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 21,
  },
  sheetEyebrow: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.25,
    marginBottom: 5,
  },
  sheetTitle: {
    fontFamily: 'serif',
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '600',
  },
  closeGlyph: {
    fontSize: 28,
    lineHeight: 31,
    fontWeight: '300',
    paddingHorizontal: 3,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 6,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  optionPill: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  optionColumn: {
    gap: 8,
  },
  intentionOption: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  intentionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  applyButton: {
    minHeight: 52,
    marginTop: 19,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  detailsSheet: {
    maxHeight: '92%',
    paddingBottom: 22,
  },
  detailImage: {
    height: 230,
    justifyContent: 'flex-end',
    backgroundColor: '#B6A79B',
    borderRadius: 16,
    overflow: 'hidden',
  },
  detailImageStyle: {
    borderRadius: 16,
  },
  detailVerified: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    margin: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(25, 24, 22, 0.52)',
  },
  detailLocation: {
    fontSize: 12,
    marginTop: 11,
  },
  detailBio: {
    fontSize: 14,
    lineHeight: 21,
  },
  detailInterest: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  detailInterestText: {
    fontSize: 12,
    fontWeight: '500',
  },
  safetyInline: {
    borderTopWidth: 1,
    marginTop: 15,
    paddingTop: 12,
  },
  reportLink: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 8,
  },
  centerModal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  safetyCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 22,
    padding: 21,
    alignItems: 'center',
  },
  safetyIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E8D9D8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },
  safetyIconGlyph: {
    fontSize: 21,
    fontWeight: '700',
  },
  safetyTitle: {
    textAlign: 'center',
    fontSize: 23,
  },
  safetyDescription: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 7,
    marginBottom: 16,
  },
  safetyAction: {
    alignSelf: 'stretch',
    minHeight: 64,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 10,
    marginTop: 8,
  },
  safetyActionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  safetyActionDescription: {
    fontSize: 11,
    marginTop: 4,
  },
  reportTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  cancelButton: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  cancelLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
