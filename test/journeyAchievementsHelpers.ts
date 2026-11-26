import type { TestInstance } from 'test-renderer';
import { StyleSheet } from 'react-native';

/**
 * Larguras em porcentagem (`width: '50%'`) dos elementos renderizados, na ordem da árvore.
 * Usado para conferir barras de progresso, que não têm texto nem rótulo próprio.
 */
export function collectPercentWidths(node: TestInstance): string[] {
  const widths: string[] = [];

  function visit(current: TestInstance) {
    const width = StyleSheet.flatten(current.props.style)?.width;
    if (typeof width === 'string' && width.endsWith('%')) {
      widths.push(width);
    }
    current.children.forEach((child) => {
      if (typeof child !== 'string') {
        visit(child);
      }
    });
  }

  visit(node);
  return widths;
}
