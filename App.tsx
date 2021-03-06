import React from 'react';
import { createStackNavigator, createAppContainer } from 'react-navigation';

import firebase from 'react-native-firebase';
import Loading from './src/pages/Loading/Loading';
import Auth from './src/pages/Auth/Auth';
import ListUser from './src/pages/ListUser/ListUser';
import Chat from './src/pages/Chat/Chat';
import ListQuestion from './src/pages/ListQuestion/ListQuestion';
import FAQ from './src/pages/FAQ/FAQ';
import { updateDeviceToken } from './src/controllers/tokens';

const AppNavigator = createStackNavigator({
    First: { screen: Loading },
    Auth,
    ListUser,
    Chat,
    FAQ,
    ListQuestion,
});

const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {

    onTokenRefreshListener;
    notificationListener;

    async componentWillMount() {
        const fcmToken = await firebase.messaging().getToken();
        if (fcmToken) {
            await updateDeviceToken(fcmToken);
        }

        this.onTokenRefreshListener = firebase.messaging().onTokenRefresh(async (fcmToken) => {
            await updateDeviceToken(fcmToken);
        });

        const enabled = await firebase.messaging().hasPermission();
        if (enabled) {
            this.createNotificationListeners();
        } else {
            try {
                await firebase.messaging().requestPermission();
            } catch (error) { }
        }
    }

    componentWillUnmount() {
        if (this.onTokenRefreshListener) this.onTokenRefreshListener();
        if (this.notificationListener) this.notificationListener();
    }

    // Notification listener
    async createNotificationListeners() {
        this.notificationListener = firebase.notifications().onNotification((notification) => {
            const { title, body } = notification;
            this.buildNotification(title, body);
        });
    }

    buildNotification(title, body) {
        const notification = new firebase.notifications.Notification()
            .setTitle(title)
            .setBody(body)
            .setSound('default');
        notification.android.setChannelId("giovanniscarpellino");
        firebase.notifications().displayNotification(notification);
    }

    render() {
        return <AppContainer />;
    }
}