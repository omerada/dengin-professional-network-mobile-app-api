# Sprint 9-10: Push Notifications

**Duration:** 2 weeks
**Focus:** FCM integration, local notifications, deep linking, badge management
**Complexity:** ⭐⭐⭐ (Medium)

---

## Sprint Goals

- ✅ Firebase Cloud Messaging (FCM) setup
- ✅ Notifee for local notifications
- ✅ Deep linking support
- ✅ Badge count management
- ✅ Notification preferences

---

## Week 1: FCM Setup & Integration

### Day 1-2: Firebase Setup

**Tasks:**

- Create Firebase project
- Add iOS app to Firebase
- Add Android app to Firebase
- Configure FCM credentials

**Setup:**

```bash
# Install dependencies
npm install @react-native-firebase/app
npm install @react-native-firebase/messaging
npm install @notifee/react-native

# iOS setup (Podfile)
cd ios && pod install

# Android setup (google-services.json)
# Place in android/app/google-services.json
```

**iOS Configuration (AppDelegate.m):**

```objc
#import <Firebase.h>
#import <UserNotifications/UserNotifications.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [FIRApp configure];

  // Request notification permissions
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  [center requestAuthorizationWithOptions:(UNAuthorizationOptionAlert | UNAuthorizationOptionSound | UNAuthorizationOptionBadge)
                        completionHandler:^(BOOL granted, NSError * _Nullable error) {
    if (granted) {
      dispatch_async(dispatch_get_main_queue(), ^{
        [[UIApplication sharedApplication] registerForRemoteNotifications];
      });
    }
  }];

  return YES;
}
```

**Android Configuration (AndroidManifest.xml):**

```xml
<service android:name="com.google.firebase.messaging.FirebaseMessagingService">
  <intent-filter>
    <action android:name="com.google.firebase.MESSAGING_EVENT" />
  </intent-filter>
</service>
```

**Validation:**

- [ ] Firebase project created
- [ ] iOS app configured
- [ ] Android app configured
- [ ] FCM token retrieves successfully

---

### Day 3-4: FCM Token Management

**Tasks:**

- Request FCM token on app start
- Send token to backend
- Handle token refresh
- Store token locally

**Code:**

```typescript
// fcmService.ts
import messaging from "@react-native-firebase/messaging";
import { apiClient } from "@core/api/client";

class FCMService {
  async requestPermission(): Promise<boolean> {
    const authStatus = await messaging().requestPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  }

  async getToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      console.log("FCM Token:", token);
      return token;
    } catch (error) {
      console.error("Failed to get FCM token:", error);
      return null;
    }
  }

  async sendTokenToServer(token: string) {
    await apiClient.post("/users/fcm-token", { token });
  }

  async setupTokenRefresh() {
    messaging().onTokenRefresh(async (newToken) => {
      console.log("FCM token refreshed:", newToken);
      await this.sendTokenToServer(newToken);
    });
  }
}

export const fcmService = new FCMService();
```

**Validation:**

- [ ] Token retrieves on first launch
- [ ] Token sent to backend
- [ ] Token refresh works
- [ ] Permissions requested correctly

---

### Day 5: Notification Handlers

**Tasks:**

- Handle foreground notifications
- Handle background notifications
- Handle notification tap
- Parse notification data

**Code:**

```typescript
// notificationHandler.ts
import messaging from "@react-native-firebase/messaging";
import { navigationRef } from "@navigation/navigationRef";

export const setupNotificationHandlers = () => {
  // Foreground notification
  messaging().onMessage(async (remoteMessage) => {
    console.log("Foreground notification:", remoteMessage);

    // Display local notification
    await notifeeService.displayNotification({
      id: remoteMessage.messageId,
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
      data: remoteMessage.data,
    });
  });

  // Background/Quit notification tap
  messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log("Notification opened app:", remoteMessage);
    handleNotificationTap(remoteMessage);
  });

  // Check if app was opened from notification
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log("App opened from notification:", remoteMessage);
        handleNotificationTap(remoteMessage);
      }
    });
};

const handleNotificationTap = (remoteMessage: any) => {
  const { type, id } = remoteMessage.data || {};

  switch (type) {
    case "message":
      navigationRef.navigate("Chat", { conversationId: id });
      break;
    case "post":
      navigationRef.navigate("PostDetails", { postId: id });
      break;
    case "verification":
      navigationRef.navigate("VerificationStatus");
      break;
  }
};
```

**Validation:**

- [ ] Foreground notifications display
- [ ] Background tap navigates correctly
- [ ] Quit state tap navigates correctly
- [ ] Deep linking works

---

## Week 2: Local Notifications & Features

### Day 1-2: Notifee Integration

**Tasks:**

- Create notification channels (Android)
- Display local notifications
- Add notification actions
- Handle notification interaction

**Code:**

```typescript
// notifeeService.ts
import notifee, {
  AndroidImportance,
  AndroidStyle,
} from "@notifee/react-native";

class NotifeeService {
  async createChannels() {
    await notifee.createChannel({
      id: "messages",
      name: "Messages",
      importance: AndroidImportance.HIGH,
      sound: "default",
    });

    await notifee.createChannel({
      id: "posts",
      name: "Posts",
      importance: AndroidImportance.DEFAULT,
    });
  }

  async displayNotification(data: {
    id: string;
    title: string;
    body: string;
    data?: any;
  }) {
    await notifee.displayNotification({
      id: data.id,
      title: data.title,
      body: data.body,
      data: data.data,
      android: {
        channelId: "messages",
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: "default",
        },
      },
      ios: {
        sound: "default",
        badgeCount: 1,
      },
    });
  }

  async setBadgeCount(count: number) {
    await notifee.setBadgeCount(count);
  }

  async clearNotification(id: string) {
    await notifee.cancelNotification(id);
  }

  async clearAllNotifications() {
    await notifee.cancelAllNotifications();
  }
}

export const notifeeService = new NotifeeService();
```

**Validation:**

- [ ] Channels created correctly
- [ ] Notifications display with sound
- [ ] Actions work (tap, dismiss)
- [ ] Badge count updates

---

### Day 3-4: Deep Linking

**Tasks:**

- Configure URL schemes
- Add universal links (iOS)
- Add App Links (Android)
- Handle deep link navigation

**iOS Info.plist:**

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>meslektas</string>
    </array>
  </dict>
</array>
```

**React Navigation Linking:**

```typescript
// linking.ts
export const linking = {
  prefixes: ["meslektas://", "https://meslektas.com"],
  config: {
    screens: {
      Main: {
        screens: {
          Feed: "feed",
          PostDetails: "posts/:postId",
          Profile: "profile/:userId",
        },
      },
      Chat: "messages/:conversationId",
      VerificationStatus: "verification/status",
    },
  },
};
```

**Validation:**

- [ ] URL scheme works (meslektas://posts/123)
- [ ] Universal links work (https://...)
- [ ] Navigation to correct screen
- [ ] Parameters passed correctly

---

### Day 5: Notification Preferences

**Tasks:**

- Create notification settings screen
- Add toggle for notification types
- Save preferences to backend
- Apply preferences locally

**Code:**

```typescript
// NotificationSettingsScreen.tsx
export const NotificationSettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState({
    messages: true,
    posts: true,
    comments: true,
    likes: false,
  });

  const updateSettings = useMutation({
    mutationFn: (newSettings: NotificationSettings) =>
      apiClient.patch("/users/notification-settings", newSettings),
    onSuccess: () => {
      Alert.alert("Başarılı", "Ayarlar kaydedildi");
    },
  });

  return (
    <ScrollView>
      <Switch
        value={settings.messages}
        onValueChange={(value) => setSettings({ ...settings, messages: value })}
      />
      <Text>Mesaj bildirimleri</Text>

      <Switch
        value={settings.posts}
        onValueChange={(value) => setSettings({ ...settings, posts: value })}
      />
      <Text>Gönderi bildirimleri</Text>

      <Button title="Kaydet" onPress={() => updateSettings.mutate(settings)} />
    </ScrollView>
  );
};
```

**Validation:**

- [ ] Settings screen renders
- [ ] Toggles update state
- [ ] Settings save to backend
- [ ] Notifications respect settings

---

## Testing Checklist

**Unit Tests:**

- [ ] fcmService.getToken()
- [ ] notifeeService.displayNotification()
- [ ] notifeeService.setBadgeCount()
- [ ] Deep link parsing

**E2E Tests:**

- [ ] Receive notification (foreground)
- [ ] Tap notification (background)
- [ ] Deep link navigation
- [ ] Badge count updates

---

## Sprint Review

**Demo:**

1. Request notification permission
2. Send test notification
3. Tap notification (navigate to screen)
4. Show badge count
5. Update notification settings
6. Test deep linking

**Metrics:**

- Lines of code: ~2,500
- Files created: ~15
- Test coverage: >65%
- Notification delivery: <2s

---

## Sprint Retrospective

**What went well:**

- FCM setup straightforward
- Deep linking works great
- Notifee reliable

**What to improve:**

- Add notification grouping
- Better error handling
- Improve settings UX

**Action items:**

- Add notification history
- Implement quiet hours
- Add notification sounds

---

## Next Sprint Preview (Sprint 11-12)

Focus: Polish & Release

- Performance optimization
- Bug fixes
- App Store/Play Store submission
- Analytics integration
