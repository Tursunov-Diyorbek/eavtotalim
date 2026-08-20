export type CropArea = {
  x: number
  y: number
  width: number
  height: number
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (err) => reject(err))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = src
  })
}

/** react-easy-crop `croppedAreaPixels` dan JPEG blob. */
export async function getCroppedImg(
  imageSrc: string,
  crop: CropArea,
): Promise<Blob> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not create canvas context')

  canvas.width = Math.round(crop.width)
  canvas.height = Math.round(crop.height)

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    canvas.width,
    canvas.height,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'))
          return
        }
        resolve(blob)
      },
      'image/jpeg',
      0.92,
    )
  })
}

export async function getCroppedFile(
  imageSrc: string,
  crop: CropArea,
  name = 'image.jpg',
): Promise<File> {
  const blob = await getCroppedImg(imageSrc, crop)
  return new File([blob], name, { type: 'image/jpeg' })
}
