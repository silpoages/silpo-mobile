import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { Animated } from 'react-native';

import {
  DiaryEntryBottomSheet,
  type DiaryEntryDraft,
} from '@/features/diary/components/DiaryEntryBottomSheet';
import { prepareDiaryPhoto } from '@/features/diary/prepareDiaryPhoto';
import { DiaryPhotoUploadError } from '@/features/diaryScreen/diaryService';

// Telas inteiras demoram no primeiro render frio (transform + coverage); evita timeout espúrio.
jest.setTimeout(15000);

jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock('@/features/diary/prepareDiaryPhoto', () => ({ prepareDiaryPhoto: jest.fn() }));
jest.mock('expo-file-system', () => ({ File: jest.fn() }));

const launchImageLibrary = ImagePicker.launchImageLibraryAsync as jest.Mock;
const mockPrepare = prepareDiaryPhoto as jest.Mock;

const entryDate = new Date(2026, 10, 25);

beforeEach(() => {
  // Animações terminam na hora, para o fechamento (que reseta o formulário) ser síncrono.
  jest.spyOn(Animated, 'timing').mockImplementation(
    () =>
      ({
        start: (callback?: Animated.EndCallback) => callback?.({ finished: true }),
      }) as unknown as Animated.CompositeAnimation,
  );
  launchImageLibrary.mockReset();
  mockPrepare.mockReset();
});

afterEach(() => {
  jest.restoreAllMocks();
});

async function renderSheet(
  overrides: Partial<{
    visible: boolean;
    onClose: jest.Mock;
    onSave: jest.Mock<Promise<void>, [DiaryEntryDraft]>;
  }> = {},
) {
  const props = {
    visible: true,
    onClose: jest.fn(),
    onSave: jest.fn<Promise<void>, [DiaryEntryDraft]>().mockResolvedValue(undefined),
    ...overrides,
  };
  const result = await render(<DiaryEntryBottomSheet entryDate={entryDate} {...props} />);
  return { ...props, ...result };
}

const noteInput = () => screen.getByLabelText('Como foi o seu dia');
const saveButton = () => screen.getByRole('button', { name: 'Salvar' });

describe('DiaryEntryBottomSheet', () => {
  it('mostra a data e a pergunta do dia', async () => {
    await renderSheet();

    expect(screen.getByText('Quarta, 25 de novembro')).toBeTruthy();
    expect(screen.getByRole('header', { name: 'Como foi o dia 25?' })).toBeTruthy();
    expect(saveButton()).toBeDisabled();
  });

  it('não renderiza o modal quando nunca foi aberto', async () => {
    await renderSheet({ visible: false });
    expect(screen.queryByText('Quarta, 25 de novembro')).toBeNull();
  });

  it('salva relato com humor e fecha', async () => {
    const { onSave, onClose } = await renderSheet();

    await fireEvent.press(screen.getByText('Triste'));
    expect(screen.getAllByText('Triste')).toHaveLength(2); // botão + badge do humor
    await fireEvent.changeText(noteInput(), '  Dia difícil  ');
    expect(saveButton()).toBeEnabled();
    await fireEvent.press(saveButton());

    expect(onSave).toHaveBeenCalledWith({
      entry_date: '2026-11-25',
      note: 'Dia difícil',
      mood: 'TRISTE',
      photoUri: null,
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('não salva relato só com espaços', async () => {
    const { onSave } = await renderSheet();
    await fireEvent.changeText(noteInput(), '   ');
    await fireEvent.press(saveButton());
    expect(onSave).not.toHaveBeenCalled();
  });

  it('adiciona e troca a foto escolhida', async () => {
    launchImageLibrary.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///orig.jpg', width: 10, height: 10 }],
    });
    mockPrepare.mockResolvedValue('file:///small.jpg');
    const { onSave } = await renderSheet();

    await fireEvent.press(screen.getByText('Adicionar foto'));

    expect(await screen.findByLabelText('Foto escolhida para o relato')).toBeTruthy();
    expect(launchImageLibrary).toHaveBeenCalledWith({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    expect(mockPrepare).toHaveBeenCalledWith({ uri: 'file:///orig.jpg', width: 10, height: 10 });
    expect(screen.getByText('Editar Foto')).toBeTruthy();

    await fireEvent.changeText(noteInput(), 'Com foto');
    await fireEvent.press(saveButton());
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ photoUri: 'file:///small.jpg' }));
  });

  it('mantém sem foto quando a escolha é cancelada', async () => {
    launchImageLibrary.mockResolvedValue({ canceled: true, assets: null });
    await renderSheet();

    await fireEvent.press(screen.getByText('Adicionar foto'));

    await waitFor(() => expect(launchImageLibrary).toHaveBeenCalled());
    expect(screen.queryByLabelText('Foto escolhida para o relato')).toBeNull();
  });

  it('avisa quando não consegue abrir as fotos', async () => {
    launchImageLibrary.mockRejectedValue(new Error('denied'));
    await renderSheet();

    await fireEvent.press(screen.getByText('Adicionar foto'));

    expect(
      await screen.findByText('Não foi possível abrir suas fotos. Tente de novo.'),
    ).toBeTruthy();
  });

  it('mostra erro genérico e mantém o relato quando salvar falha', async () => {
    const onSave = jest.fn<Promise<void>, [DiaryEntryDraft]>().mockRejectedValue(new Error('x'));
    const { onClose } = await renderSheet({ onSave });

    await fireEvent.changeText(noteInput(), 'Meu relato');
    await fireEvent.press(saveButton());

    expect(
      await screen.findByText(
        'Não foi possível salvar agora. Seu relato continua aqui, tente de novo.',
      ),
    ).toBeTruthy();
    expect(noteInput().props.value).toBe('Meu relato');
    expect(onClose).not.toHaveBeenCalled();
  });

  it.each([413, 415])('explica o erro de foto %i', async (status) => {
    const error = new DiaryPhotoUploadError(status);
    const onSave = jest.fn<Promise<void>, [DiaryEntryDraft]>().mockRejectedValue(error);
    await renderSheet({ onSave });

    await fireEvent.changeText(noteInput(), 'Relato');
    await fireEvent.press(saveButton());

    expect(await screen.findByText(`${error.message} Seu relato continua aqui.`)).toBeTruthy();
  });

  it('usa a mensagem genérica para outros erros de foto', async () => {
    const onSave = jest
      .fn<Promise<void>, [DiaryEntryDraft]>()
      .mockRejectedValue(new DiaryPhotoUploadError(500));
    await renderSheet({ onSave });

    await fireEvent.changeText(noteInput(), 'Relato');
    await fireEvent.press(saveButton());

    expect(
      await screen.findByText(
        'Não foi possível salvar agora. Seu relato continua aqui, tente de novo.',
      ),
    ).toBeTruthy();
  });

  it('fecha pelo fundo, pelo "Agora não" e pelo botão voltar do Android', async () => {
    const { onClose } = await renderSheet();

    await fireEvent.press(screen.getByRole('button', { name: 'Fechar formulário' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Agora não' }));
    const [modal] = screen.container.queryAll((node) => node.type === 'Modal');
    await act(async () => modal.props.onRequestClose());

    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('não fecha nem salva de novo enquanto está salvando', async () => {
    let resolveSave: () => void = () => {};
    const onSave = jest
      .fn<Promise<void>, [DiaryEntryDraft]>()
      .mockImplementation(() => new Promise<void>((resolve) => (resolveSave = resolve)));
    const { onClose } = await renderSheet({ onSave });

    await fireEvent.changeText(noteInput(), 'Relato');
    // O fireEvent espera o retorno do handler; aqui o salvamento fica pendente de propósito.
    const pendingSave = fireEvent.press(saveButton());
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    // O botão Salvar vira spinner; o fundo ainda é tocável mas não fecha.
    await fireEvent.press(screen.getByRole('button', { name: 'Fechar formulário' }));
    expect(onClose).not.toHaveBeenCalled();

    await act(async () => {
      resolveSave();
      await pendingSave;
    });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('limpa o formulário ao fechar e reabrir', async () => {
    const { rerender } = await renderSheet();
    await fireEvent.changeText(noteInput(), 'Rascunho');

    await rerender(
      <DiaryEntryBottomSheet
        visible={false}
        entryDate={entryDate}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />,
    );
    expect(screen.queryByLabelText('Como foi o seu dia')).toBeNull();

    await rerender(
      <DiaryEntryBottomSheet
        visible
        entryDate={entryDate}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />,
    );
    expect(noteInput().props.value).toBe('');
  });
});
