import { ImageManipulator } from 'expo-image-manipulator';

import { prepareDiaryPhoto } from '@/features/diary/prepareDiaryPhoto';

jest.mock('expo-image-manipulator', () => ({
  ImageManipulator: { manipulate: jest.fn() },
  SaveFormat: { JPEG: 'jpeg' },
}));

const manipulate = ImageManipulator.manipulate as jest.Mock;

function mockContext(resultUri = 'file:///reduced.jpg') {
  const saveAsync = jest.fn().mockResolvedValue({ uri: resultUri });
  const context = {
    resize: jest.fn(),
    renderAsync: jest.fn().mockResolvedValue({ saveAsync }),
  };
  manipulate.mockReturnValue(context);
  return { context, saveAsync };
}

describe('prepareDiaryPhoto', () => {
  beforeEach(() => manipulate.mockReset());

  it('reduz fotos de paisagem pela largura', async () => {
    const { context, saveAsync } = mockContext();

    const uri = await prepareDiaryPhoto({ uri: 'file:///orig.jpg', width: 4000, height: 3000 });

    expect(uri).toBe('file:///reduced.jpg');
    expect(manipulate).toHaveBeenCalledWith('file:///orig.jpg');
    expect(context.resize).toHaveBeenCalledWith({ width: 1600, height: null });
    expect(saveAsync).toHaveBeenCalledWith({ format: 'jpeg', compress: 0.7 });
  });

  it('reduz fotos de retrato pela altura', async () => {
    const { context } = mockContext();

    await prepareDiaryPhoto({ uri: 'file:///orig.jpg', width: 3000, height: 4000 });

    expect(context.resize).toHaveBeenCalledWith({ width: null, height: 1600 });
  });

  it('não redimensiona fotos pequenas, só recomprime', async () => {
    const { context } = mockContext('file:///small.jpg');

    const uri = await prepareDiaryPhoto({ uri: 'file:///orig.jpg', width: 800, height: 600 });

    expect(uri).toBe('file:///small.jpg');
    expect(context.resize).not.toHaveBeenCalled();
  });

  it('devolve a foto original quando a manipulação falha', async () => {
    manipulate.mockImplementation(() => {
      throw new Error('boom');
    });

    await expect(
      prepareDiaryPhoto({ uri: 'file:///orig.jpg', width: 4000, height: 3000 }),
    ).resolves.toBe('file:///orig.jpg');
  });
});
