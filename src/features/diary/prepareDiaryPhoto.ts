import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

/** Lado maior da foto enviada: nítida na tela do diário e com poucas centenas de KB. */
const MAX_PHOTO_SIDE = 1600;
const JPEG_QUALITY = 0.7;

type PickedPhoto = {
  uri: string;
  width: number;
  height: number;
};

/**
 * Reduz a foto escolhida antes do envio. Fotos de câmera em resolução original passam fácil do
 * limite do backend e demoram para subir em rede móvel. Se a redução falhar, segue com a original
 * (o backend ainda valida o tamanho).
 */
export async function prepareDiaryPhoto(photo: PickedPhoto): Promise<string> {
  try {
    const context = ImageManipulator.manipulate(photo.uri);
    const isLandscape = photo.width >= photo.height;
    const longestSide = isLandscape ? photo.width : photo.height;
    // Só reduz: fotos pequenas mantêm o tamanho. Uma dimensão só preserva a proporção.
    if (longestSide > MAX_PHOTO_SIDE) {
      context.resize(
        isLandscape
          ? { width: MAX_PHOTO_SIDE, height: null }
          : { width: null, height: MAX_PHOTO_SIDE },
      );
    }
    const image = await context.renderAsync();
    const result = await image.saveAsync({ format: SaveFormat.JPEG, compress: JPEG_QUALITY });
    return result.uri;
  } catch {
    return photo.uri;
  }
}
