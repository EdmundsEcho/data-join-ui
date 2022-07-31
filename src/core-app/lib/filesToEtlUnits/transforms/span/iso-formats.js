/**
 * @module lib/filesToEtlUnits/transforms/span/iso-formats
 *
 * @description
 * Convert user-requested output to a valid iso
 *
 */
export const toISOString = (format) => {
  const conversion = {
    'MM-YYYY': 'YYYY-MM',
    'DD-MM-YYYY': 'YYYY-MM-DD',
  };
  return conversion[format] || format;
};

export const unit = (u) => {
  const conversion = {
    y: 'years',
    Y: 'years',
    M: 'months',
    w: 'weeks',
    W: 'weeks',
    d: 'days',
    D: 'days',
    h: 'hours',
    m: 'minutes',
    s: 'seconds',
    ms: 'milliseconds',
  };
  if (!conversion[u]) {
    throw new Error({ message: `A non-iso unit is being used: ${u}` });
  }
  return conversion[u];
};
