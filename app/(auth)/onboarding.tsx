import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { THEME } from '../../lib/theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Game } from '../../lib/types';

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [username, setUsername] = useState('');
  const [usernameValid, setUsernameValid] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'); // default initial avatar placeholder
  const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'); // default initial banner

  const [playStyle, setPlayStyle] = useState('casual'); // casual, competitive, hardcore, achievement-hunter
  const [region, setRegion] = useState('North America'); // North America, Europe, Asia, South America, Oceania, Africa
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [curatedGames, setCuratedGames] = useState<Game[]>([]);
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);

  const platformsList = ['PC', 'PS5', 'Xbox Series X', 'PS4', 'Xbox One', 'Switch', 'iOS', 'Android'];
  const regionsList = ['North America', 'Europe', 'Asia', 'South America', 'Oceania', 'Africa'];
  const playStylesList = [
    { key: 'casual', label: 'Casual' },
    { key: 'competitive', label: 'Competitive' },
    { key: 'hardcore', label: 'Hardcore' },
    { key: 'completionist', label: 'Completionist' },
  ];

  // Fetch games
  useEffect(() => {
    const fetchGames = async () => {
      const { data } = await supabase.from('games').select('*');
      if (data) setCuratedGames(data);
    };
    fetchGames();
  }, []);

  // Validate Username server side
  const checkUsernameUniqueness = async (name: string) => {
    if (name.length < 3 || name.length > 20) {
      setUsernameValid(false);
      return;
    }
    
    // Format check (alphanumeric, underscores, periods)
    const regex = /^[a-zA-Z0-9_\.]+$/;
    if (!regex.test(name)) {
      setUsernameValid(false);
      return;
    }

    // Reserved keywords rejection
    const reserved = ['admin', 'moderator', 'nexora', 'support', 'staff', 'official', 'system'];
    if (reserved.includes(name.toLowerCase())) {
      setUsernameValid(false);
      return;
    }

    setUsernameChecking(true);
    try {
      const { data, error } = await supabase
        .from('usernames')
        .select('username')
        .eq('username', name.toLowerCase())
        .maybeSingle();

      if (error) {
        setUsernameValid(false);
      } else {
        setUsernameValid(data === null);
      }
    } catch {
      setUsernameValid(false);
    } finally {
      setUsernameChecking(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!displayName) {
        Alert.alert('Required', 'Please input a display name.');
        return;
      }
      if (!usernameValid) {
        Alert.alert('Required', 'Please enter a valid unique username.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (selectedPlatforms.length === 0) {
        Alert.alert('Required', 'Please select at least one gaming platform.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const togglePlatform = (p: string) => {
    if (selectedPlatforms.includes(p)) {
      setSelectedPlatforms(selectedPlatforms.filter(item => item !== p));
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const toggleGame = (id: string) => {
    if (selectedGames.includes(id)) {
      setSelectedGames(selectedGames.filter(item => item !== id));
    } else {
      setSelectedGames([...selectedGames, id]);
    }
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Insert/Claim Username
      const { error: usernameErr } = await supabase.from('usernames').insert({
        username: username.toLowerCase(),
        user_id: user.id,
      });

      if (usernameErr) {
        Alert.alert('Failed to register username', usernameErr.message);
        setLoading(false);
        return;
      }

      // 2. Update Profile fields
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          username: username.toLowerCase(),
          display_name: displayName,
          bio,
          avatar_url: avatarUrl,
          banner_url: bannerUrl,
          region,
          play_style: playStyle,
          is_private: isPrivate,
        })
        .eq('id', user.id);

      if (profileErr) {
        Alert.alert('Profile save failed', profileErr.message);
        setLoading(false);
        return;
      }

      // 3. Save user favorite games library
      if (selectedGames.length > 0) {
        const gameInserts = selectedGames.map(gameId => ({
          user_id: user.id,
          game_id: gameId,
          platform: selectedPlatforms[0] || 'PC',
          skill_level: 'casual',
        }));
        await supabase.from('user_games').insert(gameInserts);
      }

      // Complete redirect
      Alert.alert('Onboarding Completed!', 'Welcome to NEXORA.', [
        { text: 'Enter NEXORA', onPress: () => router.replace('/(tabs)/discover') }
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.progressContainer}>
        <Text style={styles.stepTitle}>Setup Profile — Step {currentStep} of 4</Text>
        <View style={styles.barBackground}>
          <View style={[styles.barFill, { width: `${currentStep * 25}%` }]} />
        </View>
      </View>

      {currentStep === 1 && (
        <View style={styles.stepCard}>
          <Text style={styles.sectionHeader}>Gamer Identity</Text>

          <Input
            label="Display Name"
            placeholder="e.g. CaisterPlayz"
            value={displayName}
            onChangeText={setDisplayName}
          />

          <View style={{ marginBottom: THEME.spacing.md }}>
            <Input
              label="Unique Username"
              placeholder="e.g. caister_playz"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setUsernameValid(null);
                checkUsernameUniqueness(text);
              }}
              autoCapitalize="none"
              error={usernameValid === false ? 'Username invalid or already claimed.' : undefined}
            />
            {usernameChecking && <Text style={styles.checkingText}>Checking username availability...</Text>}
            {usernameValid === true && <Text style={styles.validText}>✓ Username is available</Text>}
          </View>

          <Input
            label="Biography"
            placeholder="Tell other players about your journey, favorite genres, etc..."
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            style={{ height: 80, textAlignVertical: 'top' }}
          />

          {/* Quick Avatar selection */}
          <Text style={styles.subLabel}>Choose Avatar</Text>
          <View style={styles.avatarsRow}>
            {[
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
              'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            ].map((url) => (
              <TouchableOpacity
                key={url}
                onPress={() => setAvatarUrl(url)}
                style={[styles.avatarOpt, avatarUrl === url && styles.avatarOptActive]}
              >
                <View style={styles.avatarCircle}>
                  {/* Simplistic native box representation */}
                  <View style={[styles.avatarInner, { backgroundColor: avatarUrl === url ? THEME.colors.primary : THEME.colors.border }]} />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <Button title="Continue" onPress={handleNext} style={styles.nextBtn} />
        </View>
      )}

      {currentStep === 2 && (
        <View style={styles.stepCard}>
          <Text style={styles.sectionHeader}>Play Style & Region</Text>

          <Text style={styles.subLabel}>Preferred Play Style</Text>
          <View style={styles.playStyleRow}>
            {playStylesList.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.playStyleBadge, playStyle === item.key && styles.badgeActive]}
                onPress={() => setPlayStyle(item.key)}
              >
                <Text style={[styles.badgeText, playStyle === item.key && styles.badgeTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.subLabel}>Region Location</Text>
          <View style={styles.playStyleRow}>
            {regionsList.map((reg) => (
              <TouchableOpacity
                key={reg}
                style={[styles.playStyleBadge, region === reg && styles.badgeActive]}
                onPress={() => setRegion(reg)}
              >
                <Text style={[styles.badgeText, region === reg && styles.badgeTextActive]}>{reg}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.subLabel}>Gaming Platforms (Select all that apply)</Text>
          <View style={styles.playStyleRow}>
            {platformsList.map((platform) => {
              const active = selectedPlatforms.includes(platform);
              return (
                <TouchableOpacity
                  key={platform}
                  style={[styles.playStyleBadge, active && styles.badgeActive]}
                  onPress={() => togglePlatform(platform)}
                >
                  <Text style={[styles.badgeText, active && styles.badgeTextActive]}>{platform}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.btnRow}>
            <Button title="Back" variant="outline" onPress={() => setCurrentStep(1)} style={{ flex: 1, marginRight: 8 }} />
            <Button title="Continue" onPress={handleNext} style={{ flex: 1 }} />
          </View>
        </View>
      )}

      {currentStep === 3 && (
        <View style={styles.stepCard}>
          <Text style={styles.sectionHeader}>Select Favorite Games</Text>
          <Text style={styles.stepDescription}>Select from our curated title catalog to connect with matching players.</Text>

          <ScrollView style={{ maxHeight: 300, marginBottom: THEME.spacing.md }}>
            {curatedGames.length === 0 ? (
              <Text style={{ color: THEME.colors.textMuted, textAlign: 'center' }}>No games listed. Proceeding ahead...</Text>
            ) : (
              curatedGames.map((game) => {
                const checked = selectedGames.includes(game.id);
                return (
                  <TouchableOpacity
                    key={game.id}
                    style={[styles.gameListItem, checked && styles.gameListItemActive]}
                    onPress={() => toggleGame(game.id)}
                  >
                    <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>{game.title}</Text>
                    <Text style={{ color: THEME.colors.textMuted, fontSize: 12 }}>{game.genre}</Text>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          <View style={styles.btnRow}>
            <Button title="Back" variant="outline" onPress={() => setCurrentStep(2)} style={{ flex: 1, marginRight: 8 }} />
            <Button title="Continue" onPress={handleNext} style={{ flex: 1 }} />
          </View>
        </View>
      )}

      {currentStep === 4 && (
        <View style={styles.stepCard}>
          <Text style={styles.sectionHeader}>Privacy Control</Text>
          <Text style={styles.stepDescription}>
            Decide who can explore your accomplishments. You can adjust this anytime in your privacy configurations.
          </Text>

          <View style={styles.privacyOptionContainer}>
            <TouchableOpacity
              style={[styles.privacyCard, !isPrivate && styles.privacyCardActive]}
              onPress={() => setIsPrivate(false)}
            >
              <Text style={styles.privacyCardTitle}>Public Profile (Recommended)</Text>
              <Text style={styles.privacyCardDesc}>
                Any gamer can view your timeline accomplishments, stats, and search match beacons.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.privacyCard, isPrivate && styles.privacyCardActive]}
              onPress={() => setIsPrivate(true)}
            >
              <Text style={styles.privacyCardTitle}>Private Profile</Text>
              <Text style={styles.privacyCardDesc}>
                Only players you approve as followers can explore your journey entries and stats.
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.btnRow}>
            <Button title="Back" variant="outline" onPress={() => setCurrentStep(3)} style={{ flex: 1, marginRight: 8 }} />
            <Button
              title="Finalize Setup"
              onPress={handleCompleteOnboarding}
              loading={loading}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: THEME.colors.background,
    justifyContent: 'center',
    padding: THEME.spacing.lg,
  },
  progressContainer: {
    marginBottom: THEME.spacing.lg,
  },
  stepTitle: {
    color: THEME.colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: THEME.spacing.xs,
  },
  barBackground: {
    height: 6,
    backgroundColor: THEME.colors.border,
    borderRadius: 3,
  },
  barFill: {
    height: 6,
    backgroundColor: THEME.colors.primary,
    borderRadius: 3,
  },
  stepCard: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.lg,
    padding: THEME.spacing.lg,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.md,
  },
  checkingText: {
    color: THEME.colors.warning,
    fontSize: 12,
    marginTop: 4,
  },
  validText: {
    color: THEME.colors.success,
    fontSize: 12,
    marginTop: 4,
  },
  subLabel: {
    color: THEME.colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: THEME.spacing.sm,
  },
  avatarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.lg,
  },
  avatarOpt: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderColor: THEME.colors.border,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOptActive: {
    borderColor: THEME.colors.primary,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
  },
  nextBtn: {
    marginTop: THEME.spacing.md,
  },
  playStyleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: THEME.spacing.md,
  },
  playStyleBadge: {
    backgroundColor: THEME.colors.background,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.md,
    paddingVertical: THEME.spacing.xs,
    paddingHorizontal: THEME.spacing.sm,
    marginRight: 6,
    marginBottom: 6,
  },
  badgeActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  badgeText: {
    color: THEME.colors.textMuted,
    fontSize: 13,
  },
  badgeTextActive: {
    color: '#050814',
    fontWeight: 'bold',
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: THEME.spacing.lg,
  },
  stepDescription: {
    color: THEME.colors.textMuted,
    fontSize: 13,
    marginBottom: THEME.spacing.md,
  },
  gameListItem: {
    backgroundColor: THEME.colors.background,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.md,
    padding: THEME.spacing.sm,
    marginBottom: 6,
  },
  gameListItemActive: {
    borderColor: THEME.colors.primary,
  },
  privacyOptionContainer: {
    marginBottom: THEME.spacing.lg,
  },
  privacyCard: {
    backgroundColor: THEME.colors.background,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
  },
  privacyCardActive: {
    borderColor: THEME.colors.primary,
  },
  privacyCardTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },
  privacyCardDesc: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
});
