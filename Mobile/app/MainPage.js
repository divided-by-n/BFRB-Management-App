import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, query, orderByChild, get, equalTo, startAt, endAt } from 'firebase/database';
import { LineChart, BarChart } from 'react-native-chart-kit';
import * as Notifications from 'expo-notifications';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const moodIcons = {
  Anxious: require('../assets/images/moods/anxious.png'),
  Calm: require('../assets/images/moods/calm.png'),
  Sad: require('../assets/images/moods/sad.png'),
  Happy: require('../assets/images/moods/happy.png'),
};

const locationIcons = {
  Home: require('../assets/images/locations/home.png'),
  School: require('../assets/images/locations/school.png'),
  Work: require('../assets/images/locations/work.png'),
  Out: require('../assets/images/locations/out.png'),
  Other: require('../assets/images/locations/other.png'),
};

export default function MainPage() {
  const [currentDate, setCurrentDate] = useState('');
  const [behaviors, setBehaviors] = useState([]);
  const [totalTimes, setTotalTimes] = useState(0);
  const [totalDuration, setTotalDuration] = useState('00:00:00');
  const [selectedTab, setSelectedTab] = useState('Today');
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const router = useRouter();
  const websocket = useRef(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit' });
    const formattedDate = formatter.format(date);
    setCurrentDate(formattedDate);

    fetchTodayBehaviors();
    fetchWeeklyData();
    fetchMonthlyData();
    checkNotificationPermissions();
  }, []);

  useEffect(() => {
    if (notificationsEnabled) {
      const subscription = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
      });
      return () => subscription.remove();
    }
  }, [notificationsEnabled]);

  const handleConnect = () => {
    setIsConnecting(true);
    const wsUrl = 'ws://0.0.0.0:8081';
    websocket.current = new WebSocket(wsUrl);

    websocket.current.onopen = () => {
        console.log('WebSocket connection established');
        setConnectionStatus('connected');
        setIsConnecting(false);
    };

    websocket.current.onmessage = (event) => {
        console.log('Message from server: ', event.data);
        router.push('/AddBehaviourScreen');
        if (notificationsEnabled) {
          sendNotification('New behavior detected', 'A new behavior has been detected and added.');
        }
    };

    websocket.current.onclose = () => {
        console.error(`WebSocket connection closed: check server is running at ${wsUrl}`);
        setConnectionStatus('disconnected');
        setIsConnecting(false);
    };

    websocket.current.onerror = (error) => {
        console.error(`WebSocket error: check server is running at ${wsUrl}`, error);
        setConnectionStatus('error');
        setIsConnecting(false);
    };
  };

  const fetchTodayBehaviors = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      router.push('/LogInScreen');
      return;
    }

    const today = new Date();
    const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const db = getDatabase();
    const behaviorsRef = query(ref(db, `users/${user.uid}/behaviors`), orderByChild('date'), equalTo(dateString));
    const snapshot = await get(behaviorsRef);

    const behaviorsData = [];
    let totalDurationInSeconds = 0;

    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      behaviorsData.push(data);

      const durationParts = data.duration.split(':').map(Number);

      if (durationParts.length === 3) {
        const durationInSeconds = durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2];
        totalDurationInSeconds += durationInSeconds;
      } else if (durationParts.length === 1) {
        totalDurationInSeconds += durationParts[0] * 60;
      }
    });

    setBehaviors(behaviorsData);
    setTotalTimes(behaviorsData.length);

    const hours = Math.floor(totalDurationInSeconds / 3600);
    const minutes = Math.floor((totalDurationInSeconds % 3600) / 60);
    const seconds = totalDurationInSeconds % 60;
    setTotalDuration(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
  };

  const fetchWeeklyData = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      router.push('/LogInScreen');
      return;
    }

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(today);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekStartString = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
    const weekEndString = `${weekEnd.getFullYear()}-${String(weekEnd.getMonth() + 1).padStart(2, '0')}-${String(weekEnd.getDate()).padStart(2, '0')}`;

    const db = getDatabase();
    const behaviorsRef = query(ref(db, `users/${user.uid}/behaviors`), orderByChild('date'), startAt(weekStartString), endAt(weekEndString));
    const snapshot = await get(behaviorsRef);

    const data = Array(7).fill(0);

    snapshot.forEach((childSnapshot) => {
      const date = childSnapshot.val().date;
      const dayIndex = new Date(date).getDay();
      data[dayIndex] += 1;
    });

    setWeeklyData(data);
  };

  const fetchMonthlyData = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      router.push('/LogInScreen');
      return;
    }

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const monthStartString = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}-${String(monthStart.getDate()).padStart(2, '0')}`;
    const monthEndString = `${monthEnd.getFullYear()}-${String(monthEnd.getMonth() + 1).padStart(2, '0')}-${String(monthEnd.getDate()).padStart(2, '0')}`;

    const db = getDatabase();
    const behaviorsRef = query(ref(db, `users/${user.uid}/behaviors`), orderByChild('date'), startAt(monthStartString), endAt(monthEndString));
    const snapshot = await get(behaviorsRef);

    const data = Array(monthEnd.getDate()).fill(0);

    snapshot.forEach((childSnapshot) => {
      const date = childSnapshot.val().date;
      const day = new Date(date).getDate();
      data[day - 1] += 1;
    });

    setMonthlyData(data);
  };

  const renderChart = () => {
    const chartHeight = screenHeight * 0.4;
    
    if (selectedTab === 'Week') {
      return (
        <BarChart
          data={{
            labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            datasets: [
              {
                data: weeklyData.length > 0 ? weeklyData : Array(7).fill(0),
              },
            ],
          }}
          width={screenWidth - 40}
          height={chartHeight}
          chartConfig={{
            backgroundColor: '#F7EEE9',
            backgroundGradientFrom: '#F7EEE9',
            backgroundGradientTo: '#F7EEE9',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForBackgroundLines: {
              strokeDasharray: '',
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      );
    } else if (selectedTab === 'Month') {
      const today = new Date();
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const lastDayOfMonth = monthEnd.getDate();
      const labels = Array.from({ length: lastDayOfMonth }, (_, i) => {
        const day = i + 1;
        return [1, 7, 14, 21, lastDayOfMonth].includes(day) ? day.toString() : '';
      });

      const data = Array.from({ length: lastDayOfMonth }, (_, i) => monthlyData[i] || 0);

      return (
        <LineChart
          data={{
            labels: labels,
            datasets: [
              {
                data: data.length > 0 ? data : Array(lastDayOfMonth).fill(0),
              },
            ],
          }}
          width={screenWidth - 40}
          height={chartHeight}
          chartConfig={{
            backgroundColor: '#F7EEE9',
            backgroundGradientFrom: '#F7EEE9',
            backgroundGradientTo: '#F7EEE9',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 5,
            },
            propsForDots: {
              r: '2',
              strokeWidth: '1',
              stroke: '#F7EEE9',
            },
            propsForBackgroundLines: {
              strokeDasharray: '',
              strokeWidth: 0,
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      );
    }
    return null;
  };

  const checkNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        Alert.alert('Permission required', 'Please enable notifications in your settings.');
      }
      setNotificationsEnabled(newStatus === 'granted');
    } else {
      setNotificationsEnabled(true);
    }
  };

  const sendNotification = async (title, body) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
      },
      trigger: null,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Behaviours Summary</Text>
        <Text style={styles.date}>{currentDate}</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={selectedTab === 'Today' ? styles.tabSelected : styles.tab} onPress={() => setSelectedTab('Today')}>
          <Text style={styles.tabText}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity style={selectedTab === 'Week' ? styles.tabSelected : styles.tab} onPress={() => setSelectedTab('Week')}>
          <Text style={styles.tabText}>Week</Text>
        </TouchableOpacity>
        <TouchableOpacity style={selectedTab === 'Month' ? styles.tabSelected : styles.tab} onPress={() => setSelectedTab('Month')}>
          <Text style={styles.tabText}>Month</Text>
        </TouchableOpacity>
      </View>

      {selectedTab === 'Today' ? (
        <>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Times</Text>
              <Text style={styles.summaryValue}>{totalTimes}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>{totalDuration}</Text>
            </View>
          </View>

          <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
            {behaviors.length > 0 ? (
              behaviors.map((behavior, index) => (
                <View key={index} style={styles.behaviorItem}>
                  <View style={styles.behaviorRow}>
                    <Text style={styles.behaviorTitle}>{behavior.behaviour}</Text>
                    <Text style={styles.behaviorTime}>{new Date(behavior.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                  <View style={styles.behaviorDetails}>
                    <View style={styles.behaviorDetail}>
                      <Image source={moodIcons[behavior.mood]} style={styles.icon} />
                      <Text style={styles.behaviorText}>{behavior.mood}</Text>
                    </View>
                    <View style={styles.behaviorDetail}>
                      <Image source={locationIcons[behavior.location]} style={styles.icon} />
                      <Text style={styles.behaviorText}>{behavior.location}</Text>
                    </View>
                    <View style={styles.behaviorDetail}>
                      <Text style={styles.durationText}>{behavior.duration}</Text>
                      <Text style={styles.behaviorText}>mins</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text>There is no data today</Text>
            )}
          </ScrollView>
        </>
      ) : (
        renderChart()
      )}

      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.footerButton} onPress={() => router.push('/SettingsScreen')}>
          <Image source={require('../assets/images/icons/settings.png')} style={styles.footerIcon} />
          <Text style={styles.footerButtonText}>Settings</Text>
        </TouchableOpacity>
        
        <View style={styles.connectContainer}>
          {isConnecting ? (
            <ActivityIndicator size="large" color="#000000" />
          ) : (
            <TouchableOpacity style={styles.connectButton} onPress={handleConnect}>
              <Image source={require('../assets/images/icons/connect.png')} style={styles.footerIcon} />
              <Text style={styles.footerButtonText}>
                {connectionStatus && ` ${connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'disconnected' ? 'To Connect' : 'Error'}`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.footerButton} onPress={() => router.push('/AddBehaviourScreen')}>
          <Image source={require('../assets/images/icons/add.png')} style={styles.footerIcon} />
          <Text style={styles.footerButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D6C1A1',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  date: {
    fontSize: 16,
    color: '#000',
    marginBottom: 20,
  },
  headerContainer: {
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#D6C1A1',
    borderRadius: 20,
  },
  tabSelected: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#F7EEE9',
    borderRadius: 20,
  },
  tabText: {
    fontSize: 16,
    color: '#000',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  summaryItem: {
    backgroundColor: '#F7EEE9',
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
    width: '45%',
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryValue: {
    fontSize: 16,
  },
  scrollArea: {
    flex: 1,
    width: '100%',
    borderRadius: 15,
    backgroundColor: '#F7EEE9',
    marginBottom: 10,
  },
  scrollContent: {
    padding: 10,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  footerButton: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#D6C1A1',
    borderRadius: 20,
  },
  footerButtonText: {
    fontSize: 12,
    color: '#000',
    marginTop: 5,
  },
  footerIcon: {
    width: 30,
    height: 30,
  },
  behaviorItem: {
    backgroundColor: '#FFF2DF',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  behaviorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  behaviorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  behaviorTime: {
    fontSize: 16,
  },
  behaviorDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  behaviorDetail: {
    alignItems: 'center',
    width: '33%',
  },
  behaviorText: {
    fontSize: 14,
    color: '#000',
  },
  durationText: {
    fontSize: 30,
    color: '#000',
    marginBottom: -8,
  },
  icon: {
    width: 30,
    height: 30,
    marginBottom: 4,
  },
  connectContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  connectButton: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#D6C1A1',
    borderRadius: 20,
  },
  connectButtonText: {
    fontSize: 12,
    color: '#000',
    marginTop: 5,
  },
});
