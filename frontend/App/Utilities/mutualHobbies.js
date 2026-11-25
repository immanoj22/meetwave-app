/**
 * Stable id for hobby objects or raw ids (matches HomeDetail / profile APIs).
 */
export function hobbyIdString(h) {
  if (h == null) return '';
  if (typeof h === 'object' && h._id != null) return String(h._id);
  return String(h);
}

function hobbyLabel(h) {
  return h?.hobbyname ?? h?.hobbyName ?? '';
}

/**
 * Hobbies on `otherHobbies` that also appear on the viewer's list, sorted by name.
 */
export function getMutualHobbiesSorted(viewerHobbies, otherHobbies) {
  if (!Array.isArray(otherHobbies) || otherHobbies.length === 0) return [];

  const myIds = new Set(
    (viewerHobbies || []).map(h => hobbyIdString(h)).filter(Boolean),
  );

  const mutual = otherHobbies.filter(h => {
    const id = hobbyIdString(h);
    return id.length > 0 && myIds.has(id);
  });

  return [...mutual].sort((a, b) =>
    hobbyLabel(a).localeCompare(hobbyLabel(b), undefined, {
      sensitivity: 'base',
    }),
  );
}

/**
 * Full hobby list for detail screens: mutual hobbies first, each tagged with
 * `isMutual` for green chip styling (matches HomeDetail profile page).
 */
export function getHobbiesWithMutualSorted(viewerHobbies, otherHobbies) {
  if (!Array.isArray(otherHobbies) || otherHobbies.length === 0) return [];

  const myIds = new Set(
    (viewerHobbies || []).map(h => hobbyIdString(h)).filter(Boolean),
  );

  const enriched = otherHobbies.map(h => {
    const id = hobbyIdString(h);
    return {
      ...h,
      isMutual: id.length > 0 && myIds.has(id),
    };
  });

  return [...enriched].sort((a, b) => {
    if (a.isMutual !== b.isMutual) return a.isMutual ? -1 : 1;
    return hobbyLabel(a).localeCompare(hobbyLabel(b), undefined, {
      sensitivity: 'base',
    });
  });
}
