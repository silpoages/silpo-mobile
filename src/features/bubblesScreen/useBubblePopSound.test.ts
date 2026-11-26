import { renderHook } from '@testing-library/react-native';
import { useAudioPlayer } from 'expo-audio';

import { pickNextSoundIndex, useBubblePopSound } from './useBubblePopSound';

jest.mock('expo-audio', () => ({ useAudioPlayer: jest.fn() }));

const useAudioPlayerMock = useAudioPlayer as jest.Mock;

type FakePlayer = { seekTo: jest.Mock; play: jest.Mock };

function createPlayers(): FakePlayer[] {
  return [0, 1, 2].map(() => ({
    seekTo: jest.fn().mockResolvedValue(undefined),
    play: jest.fn(),
  }));
}

describe('pickNextSoundIndex', () => {
  it('devolve 0 quando há um som ou nenhum', () => {
    expect(pickNextSoundIndex(1, 0)).toBe(0);
    expect(pickNextSoundIndex(0, -1)).toBe(0);
  });

  it('nunca repete o último índice', () => {
    expect(pickNextSoundIndex(3, 0, () => 0)).toBe(1);
    expect(pickNextSoundIndex(3, 0, () => 0.99)).toBe(2);
    expect(pickNextSoundIndex(3, 1, () => 0)).toBe(0);
    expect(pickNextSoundIndex(3, 1, () => 0.6)).toBe(2);
  });

  it('usa Math.random por padrão', () => {
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0);
    expect(pickNextSoundIndex(3, -1)).toBe(0);
    spy.mockRestore();
  });
});

describe('useBubblePopSound', () => {
  let players: FakePlayer[];

  beforeEach(() => {
    players = createPlayers();
    let call = 0;
    useAudioPlayerMock.mockReset();
    useAudioPlayerMock.mockImplementation(() => players[call++ % 3]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('pré-carrega três players e toca um som do início, sem repetir o anterior', async () => {
    const random = jest.spyOn(Math, 'random').mockReturnValue(0);
    const { result } = await renderHook(() => useBubblePopSound());

    expect(useAudioPlayerMock).toHaveBeenCalledTimes(3);

    result.current();
    expect(players[0].seekTo).toHaveBeenCalledWith(0);
    expect(players[0].play).toHaveBeenCalledTimes(1);

    // Com o último índice 0, o sorteio passa a escolher entre 1 e 2.
    result.current();
    expect(players[1].play).toHaveBeenCalledTimes(1);
    expect(random).toHaveBeenCalled();
  });

  it('ignora falhas no seek (promessa rejeitada) e no play', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    players[0].seekTo.mockRejectedValue(new Error('seek'));
    players[0].play.mockImplementation(() => {
      throw new Error('play');
    });
    const { result } = await renderHook(() => useBubblePopSound());

    expect(() => result.current()).not.toThrow();
    await Promise.resolve();
    expect(players[0].play).toHaveBeenCalled();
  });
});
