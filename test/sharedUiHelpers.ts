import { screen } from '@testing-library/react-native';

/** Host nativo do `Modal` aberto (o único elemento com `onRequestClose`), para simular o "voltar" do Android. */
export function getModalHost() {
  const [host] = screen.container.queryAll(
    (instance) => typeof instance.props.onRequestClose === 'function',
  );
  if (!host) {
    throw new Error('Nenhum Modal com onRequestClose encontrado');
  }
  return host;
}
