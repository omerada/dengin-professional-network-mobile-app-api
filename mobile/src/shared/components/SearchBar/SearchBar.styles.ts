// src/shared/components/SearchBar/SearchBar.styles.ts
// Meslektaş Design System - SearchBar Styles
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import { StyleSheet } from 'react-native';
import { spacing } from '@theme';

export const styles = StyleSheet.create({
  cancelButton: {
    justifyContent: 'center',
    paddingLeft: spacing['3'],
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  clearButton: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    marginLeft: spacing['2'],
    width: 24,
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  input: {
    flex: 1,
    marginLeft: spacing['2'],
    padding: 0,
  },
  inputContainer: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    flexDirection: 'row',
  },
  loadingIndicator: {
    marginLeft: spacing['2'],
  },
});
