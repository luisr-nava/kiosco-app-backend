import rawTimeZones from '@vvo/tzdb/raw-time-zones.json';
import { countries } from 'countries-list';

type RawTimeZone = (typeof rawTimeZones)[number];
type TimezonesByCountry = Record<string, RawTimeZone[]>;

const TIMEZONES_BY_COUNTRY: TimezonesByCountry = rawTimeZones.reduce(
  (acc, timezone) => {
    const countryCode = timezone.countryCode.toUpperCase();
    acc[countryCode] = acc[countryCode] || [];
    acc[countryCode].push(timezone);
    return acc;
  },
  {} as TimezonesByCountry,
);

const TIMEZONE_CACHE = new Map<string, string>();

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const pickByCapital = (countryCode: string, timezones: RawTimeZone[]) => {
  const capital = countries[countryCode]?.capital;

  if (!capital) {
    return null;
  }

  const normalizedCapital = normalize(capital);

  return (
    timezones.find((timezone) =>
      timezone.mainCities.some((city) => normalize(city) === normalizedCapital),
    ) ?? null
  );
};

const pickFallback = (timezones: RawTimeZone[]) =>
  timezones.reduce<RawTimeZone>((best, candidate) => {
    if (!best) {
      return candidate;
    }

    if (candidate.group.length !== best.group.length) {
      return candidate.group.length > best.group.length ? candidate : best;
    }

    if (candidate.mainCities.length !== best.mainCities.length) {
      return candidate.mainCities.length > best.mainCities.length
        ? candidate
        : best;
    }

    return candidate.rawOffsetInMinutes > best.rawOffsetInMinutes
      ? candidate
      : best;
  }, timezones[0]);

export const getTimezoneForCountry = (countryCode: string): string | null => {
  if (!countryCode) {
    return null;
  }

  const normalizedCode = countryCode.toUpperCase();
  const cached = TIMEZONE_CACHE.get(normalizedCode);

  if (cached) {
    return cached;
  }

  const timezones = TIMEZONES_BY_COUNTRY[normalizedCode];

  if (!timezones?.length) {
    return null;
  }

  const timezone =
    pickByCapital(normalizedCode, timezones) ?? pickFallback(timezones);

  TIMEZONE_CACHE.set(normalizedCode, timezone.name);

  return timezone.name;
};
