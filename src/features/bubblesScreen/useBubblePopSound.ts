import { useAudioPlayer } from 'expo-audio';
import { useRef } from 'react';

const POP_SOUNDS = [
  require('../../../assets/sounds/bubbles/pop-1.mp3'),
  require('../../../assets/sounds/bubbles/pop-2.mp3'),
  require('../../../assets/sounds/bubbles/pop-3.mp3'),
];

/** Sorteia o próximo som, sem repetir o último tocado. */
export function pickNextSoundIndex(count: number, lastIndex: number, random = Math.random): number {
  if (count <= 1) return 0;
  const candidates = Array.from({ length: count }, (_, index) => index).filter(
    (index) => index !== lastIndex,
  );
  return candidates[Math.floor(random() * candidates.length)];
}

/**
 * Pré-carrega os sons de estouro e devolve uma função que toca um deles, sorteado.
 * Cada som tem seu próprio player, então estouros seguidos com sons diferentes se sobrepõem;
 * um som repetido mais tarde recomeça do início.
 */
export function useBubblePopSound(): () => void {
  const players = [
    useAudioPlayer(POP_SOUNDS[0]),
    useAudioPlayer(POP_SOUNDS[1]),
    useAudioPlayer(POP_SOUNDS[2]),
  ];
  const lastIndex = useRef(-1);

  return () => {
    const index = pickNextSoundIndex(players.length, lastIndex.current);
    lastIndex.current = index;
    const player = players[index];
    try {
      // O som é só um complemento: uma falha no áudio não pode atrapalhar o jogo.
      void player.seekTo(0).catch(() => {});
      player.play();
    } catch {
      // ignora
    }
  };
}
