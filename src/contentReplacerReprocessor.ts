/**
 * Reprocesses the song content by just replacing certain string sections.
 * This is useful for songs that have been processed with the old version
 * of the app and bring the version up to date.
 *
 * @param songContent The song content to be reprocessed
 */
export const reprocess = (songContent: string) =>
  songContent
    .replaceAll('  ', ' ')
    .replaceAll(' .', '.')
    .replaceAll('ş', 'ș')
    .replaceAll('Ş', 'Ș')
    .replaceAll('ţ', 'ț')
    .replaceAll('Ţ', 'Ț')
    .replaceAll('doamne', 'Doamne')
    .replaceAll('Nici o', 'Nicio')
    .replaceAll('nici o', 'nicio')
    .replaceAll('Nici un', 'Niciun')
    .replaceAll('nici un', 'niciun')
    .replaceAll('domnul', 'Domnul')
    .replaceAll('dumnezeu', 'Dumnezeu')
    .replaceAll('golgota', 'Golgota')
    .replaceAll('isus', 'Isus')
    .replaceAll('isuse', 'Isuse')
    .replaceAll('mesia', 'Mesia')
    .replaceAll('miel', 'Miel')
    .replaceAll("'", '’')
    .replaceAll('‘', '’')
    .replaceAll('"', '”')
    .replaceAll('…', '...')
    .replaceAll('//', '/');
