// __tests__/unit/shared/Container.test.tsx
// Unit tests for Container layout component
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { Container, Row, Column, Spacer } from '@shared/layout';

// Mock theme context
jest.mock('@contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: { primary: '#FFFFFF' },
      },
    },
  }),
}));

// Mock spacing
jest.mock('@theme', () => ({
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
}));

describe('Container', () => {
  it('should render children correctly', () => {
    const { getByText } = render(
      <Container>
        <Text>Test Content</Text>
      </Container>,
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('should apply padding based on prop', () => {
    const { getByTestId } = render(
      <Container padding="lg" testID="container">
        <Text>Content</Text>
      </Container>,
    );

    const container = getByTestId('container');
    expect(container).toBeTruthy();
  });

  it('should respect size prop for max-width', () => {
    const { getByTestId } = render(
      <Container size="md" testID="container">
        <Text>Content</Text>
      </Container>,
    );

    const container = getByTestId('container');
    expect(container.props.style).toBeDefined();
  });

  it('should center content when center prop is true', () => {
    const { getByTestId } = render(
      <Container center testID="container">
        <Text>Content</Text>
      </Container>,
    );

    const container = getByTestId('container');
    expect(container.props.style.alignSelf).toBe('center');
  });

  it('should apply flex when flex prop is true', () => {
    const { getByTestId } = render(
      <Container flex testID="container">
        <Text>Content</Text>
      </Container>,
    );

    const container = getByTestId('container');
    expect(container.props.style.flex).toBe(1);
  });

  it('should apply custom background color', () => {
    const { getByTestId } = render(
      <Container backgroundColor="#FF0000" testID="container">
        <Text>Content</Text>
      </Container>,
    );

    const container = getByTestId('container');
    expect(container.props.style.backgroundColor).toBe('#FF0000');
  });
});

describe('Row', () => {
  it('should render children in a row', () => {
    const { getByTestId, getByText } = render(
      <Row testID="row">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Row>,
    );

    const row = getByTestId('row');
    expect(row.props.style.flexDirection).toBe('row');
    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
  });

  it('should apply gap between items', () => {
    const { getByTestId } = render(
      <Row gap={20} testID="row">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Row>,
    );

    const row = getByTestId('row');
    expect(row.props.style.gap).toBe(20);
  });

  it('should align items correctly', () => {
    const { getByTestId } = render(
      <Row align="flex-end" testID="row">
        <Text>Item</Text>
      </Row>,
    );

    const row = getByTestId('row');
    expect(row.props.style.alignItems).toBe('flex-end');
  });

  it('should justify content correctly', () => {
    const { getByTestId } = render(
      <Row justify="space-between" testID="row">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Row>,
    );

    const row = getByTestId('row');
    expect(row.props.style.justifyContent).toBe('space-between');
  });

  it('should wrap items when wrap is true', () => {
    const { getByTestId } = render(
      <Row wrap testID="row">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Row>,
    );

    const row = getByTestId('row');
    expect(row.props.style.flexWrap).toBe('wrap');
  });
});

describe('Column', () => {
  it('should render children in a column', () => {
    const { getByTestId, getByText } = render(
      <Column testID="column">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Column>,
    );

    const column = getByTestId('column');
    expect(column.props.style.flexDirection).toBe('column');
    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
  });

  it('should apply gap between items', () => {
    const { getByTestId } = render(
      <Column gap={16} testID="column">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Column>,
    );

    const column = getByTestId('column');
    expect(column.props.style.gap).toBe(16);
  });

  it('should apply flex when flex is true', () => {
    const { getByTestId } = render(
      <Column flex testID="column">
        <Text>Item</Text>
      </Column>,
    );

    const column = getByTestId('column');
    expect(column.props.style.flex).toBe(1);
  });
});

describe('Spacer', () => {
  it('should render vertical spacer by default', () => {
    const { UNSAFE_getByType } = render(<Spacer />);

    const spacer = UNSAFE_getByType(View);
    expect(spacer.props.style.height).toBeDefined();
  });

  it('should render horizontal spacer when horizontal is true', () => {
    const { UNSAFE_getByType } = render(<Spacer horizontal />);

    const spacer = UNSAFE_getByType(View);
    expect(spacer.props.style.width).toBeDefined();
  });

  it('should apply custom size', () => {
    const { UNSAFE_getByType } = render(<Spacer size={32} />);

    const spacer = UNSAFE_getByType(View);
    expect(spacer.props.style.height).toBe(32);
  });
});
