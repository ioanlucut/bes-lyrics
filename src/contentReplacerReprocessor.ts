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
    .replaceAll(/((?!\W))Nici o((?!\w))/g, 'Nicio')
    .replaceAll(/((?!\W))nici o((?!\w))/g, 'nicio')
    .replaceAll(/((?!\W))Nici un((?!\w))/g, 'Niciun')
    .replaceAll(/((?!\W))nici un((?!\w))/g, 'niciun')
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
