import React from 'react';
import { render, screen } from '@testing-library/react';
import { HydrationProvider } from '@/components/providers/HydrationProvider';

describe('HydrationProvider Component', () => {
    test('1. should render children without errors', () => {
        const testContent = 'Test Content';
        render(
            <HydrationProvider>
                <div>{testContent}</div>
            </HydrationProvider>
        );
        expect(screen.getByText(testContent)).toBeInTheDocument();
    });

    test('2. should render multiple children', () => {
        render(
            <HydrationProvider>
                <div>Child 1</div>
                <div>Child 2</div>
                <div>Child 3</div>
            </HydrationProvider>
        );
        expect(screen.getByText('Child 1')).toBeInTheDocument();
        expect(screen.getByText('Child 2')).toBeInTheDocument();
        expect(screen.getByText('Child 3')).toBeInTheDocument();
    });

    test('3. should handle nested components', () => {
        render(
            <HydrationProvider>
                <div>
                    <div>Nested Content</div>
                </div>
            </HydrationProvider>
        );
        expect(screen.getByText('Nested Content')).toBeInTheDocument();
    });

    test('4. should render empty children', () => {
        const { container } = render(
            <HydrationProvider>
                <div />
            </HydrationProvider>
        );
        expect(container.firstChild).toBeInTheDocument();
    });

    test('5. should handle complex JSX structures', () => {
        render(
            <HydrationProvider>
                <article>
                    <h1>Title</h1>
                    <section>
                        <p>Paragraph</p>
                    </section>
                </article>
            </HydrationProvider>
        );
        expect(screen.getByText('Title')).toBeInTheDocument();
        expect(screen.getByText('Paragraph')).toBeInTheDocument();
    });
});
