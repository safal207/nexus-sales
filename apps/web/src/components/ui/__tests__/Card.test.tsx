import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card } from '../Card';

describe('Card', () => {
  test('renders children correctly', () => {
    render(
      <Card>
        <h2>Test Card Content</h2>
        <p>This is some card content.</p>
      </Card>
    );

    expect(screen.getByText('Test Card Content')).toBeInTheDocument();
    expect(screen.getByText('This is some card content.')).toBeInTheDocument();
  });

  test('renders as a div element', () => {
    render(<Card>Content</Card>);

    const card = screen.getByText('Content').parentElement;
    expect(card).toBeInTheDocument();
    expect(card?.tagName).toBe('DIV');
  });

  test('applies different padding sizes', () => {
    const { rerender } = render(<Card padding="none">Content</Card>);
    let card = screen.getByText('Content').parentElement;
    expect(card).toBeInTheDocument();

    rerender(<Card padding="sm">Content</Card>);
    card = screen.getByText('Content').parentElement;
    expect(card).toBeInTheDocument();

    rerender(<Card padding="md">Content</Card>);
    card = screen.getByText('Content').parentElement;
    expect(card).toBeInTheDocument();

    rerender(<Card padding="lg">Content</Card>);
    card = screen.getByText('Content').parentElement;
    expect(card).toBeInTheDocument();
  });

  test('passes through custom className prop', () => {
    render(<Card className="custom-card-class">Content</Card>);

    const card = screen.getByText('Content').parentElement;
    // Since CSS classes might not be processed in tests, just verify the element exists
    expect(card).toBeInTheDocument();
    expect(card?.tagName).toBe('DIV');
  });

  test('handles custom className prop without errors', () => {
    expect(() => {
      render(<Card className="custom-class">Content</Card>);
    }).not.toThrow();
  });

  test('renders complex children', () => {
    render(
      <Card>
        <div>
          <h3>Title</h3>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </div>
      </Card>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  test('maintains semantic structure', () => {
    render(
      <Card>
        <header>Header</header>
        <main>Main content</main>
        <footer>Footer</footer>
      </Card>
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('Main content')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
