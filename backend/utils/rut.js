const validateRUT = (rut) => {
  if (!rut || typeof rut !== 'string') return false;

  const cleaned = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
  if (!/^\d+[0-9K]$/.test(cleaned)) return false;

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  let expectedDV;
  if (remainder === 11) expectedDV = '0';
  else if (remainder === 10) expectedDV = 'K';
  else expectedDV = remainder.toString();

  return expectedDV === dv;
};

const formatRUT = (rut) => {
  if (!rut) return '';
  const cleaned = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
  if (cleaned.length <= 1) return cleaned;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted}-${dv}`;
};

module.exports = { validateRUT, formatRUT };
