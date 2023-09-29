const getRegexNotMatchingStartOfALine = (text: string) =>
  new RegExp(`(?<!^)(?<!/: )${text}(?!\\w)`, 'gm');

/**
 * Reprocesses the song content by just replacing certain string sections.
 * This is useful for songs that have been processed with the old version
 * of the app and bring the version up to date.
 *
 * @param songContent The song content to be reprocessed
 */
export const reprocess = (songContent: string) =>
  songContent
    // Not at the beginning of the line
    .replaceAll(getRegexNotMatchingStartOfALine('Nici o'), 'Nicio')
    .replaceAll(getRegexNotMatchingStartOfALine('nici o'), 'nicio')
    .replaceAll(getRegexNotMatchingStartOfALine('Nici un'), 'Niciun')
    .replaceAll(getRegexNotMatchingStartOfALine('nici un'), 'niciun')
    .replaceAll(getRegexNotMatchingStartOfALine('Lui Dumnezeu'), 'lui Dumnezeu')
    .replaceAll(getRegexNotMatchingStartOfALine('Lui Isus'), 'lui Isus')
    .replaceAll(getRegexNotMatchingStartOfALine('Lui Hristos'), 'lui Hristos')
    .replaceAll(getRegexNotMatchingStartOfALine('Lui Mesia'), 'lui Mesia')
    .replaceAll('doamne', 'Doamne')
    .replaceAll('domnul', 'Domnul')
    .replaceAll('dumnezeu', 'Dumnezeu')
    .replaceAll('golgota', 'Golgota')
    .replaceAll('isus', 'Isus')
    .replaceAll('isuse', 'Isuse')
    .replaceAll('mesia', 'Mesia')
    .replaceAll('miel', 'Miel')
    .replaceAll('ş', 'ș')
    .replaceAll('Ş', 'Ș')
    .replaceAll('ţ', 'ț')
    .replaceAll('Ţ', 'Ț')
    .replaceAll('  ', ' ')
    .replaceAll(' .', '.')
    .replaceAll("'", '’')
    .replaceAll('"', '”')
    .replaceAll('…', '...')
    .replaceAll('//', '/');
