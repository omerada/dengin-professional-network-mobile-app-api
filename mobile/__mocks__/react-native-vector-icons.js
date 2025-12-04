// __mocks__/react-native-vector-icons.js
import React from 'react';
import { Text } from 'react-native';

const Icon = ({ name, ...props }) => <Text {...props}>{name}</Text>;

export default Icon;
