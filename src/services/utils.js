export const toBase64 = file => new Promise((resolve, reject) => {
  try {
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    }
  } catch (err) {
    console.log('ERROR', err)
  }
});

export const getUnitFromByte = (weight) => {
  if (weight / 1024000000 > 1) {
    return 'Go'
  }

  if (weight / 1024000 > 1) {
    return 'Mo'
  }

  if (weight / 1024 > 1) {
    return 'Ko'
  }

  return 'B'
}

export const convertByte = (byte, unit) => {
  if (unit === 'Go') {
    return byte / 1024000000
  }

  if (unit === 'Mo') {
    return byte / 1024000
  }

  if (unit === 'Ko') {
    return byte / 1024
  }

  return byte
}

export const arround = (value) => {
  return Math.round(value * 100) / 100
}

export const formatPercent = (decimal) => {
  return `${arround(decimal * 100)} %`
}